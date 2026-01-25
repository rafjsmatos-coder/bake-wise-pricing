import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Service role client for database operations and auth validation
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  const authHeader = req.headers.get("Authorization");
  const userToken = authHeader?.replace("Bearer ", "") ?? "";

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    if (!authHeader) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        status: 'expired',
        error: "Not authenticated" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Authorization header found");

    // Use admin client to validate user token (bypasses JWT expiry issues)
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(userToken);
    
    if (userError || !userData?.user) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false, 
        status: 'expired',
        error: "Session expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No email found");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        status: 'expired' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get subscription from database using admin client
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      logStep("Error fetching subscription", { error: subError.message });
    }

    // If no subscription exists, create trial
    if (!subscription) {
      logStep("No subscription found, creating trial");
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      
      const { data: newSub, error: createError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'trial',
          trial_start: new Date().toISOString(),
          trial_end: trialEnd.toISOString()
        })
        .select()
        .single();

      if (createError) {
        logStep("Error creating subscription", { error: createError.message });
        throw new Error(`Failed to create subscription: ${createError.message}`);
      }

      return new Response(JSON.stringify({
        subscribed: true,
        status: 'trial',
        trial_end: trialEnd.toISOString(),
        days_remaining: 14
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Subscription found", { status: subscription.status, stripe_subscription_id: subscription.stripe_subscription_id });

    // Check trial status
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 0) {
        // Trial expired - update using admin client
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', user.id);

        logStep("Trial expired");
        return new Response(JSON.stringify({
          subscribed: false,
          status: 'expired',
          trial_end: subscription.trial_end,
          days_remaining: 0
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("Trial active", { daysRemaining });
      return new Response(JSON.stringify({
        subscribed: true,
        status: 'trial',
        trial_end: subscription.trial_end,
        days_remaining: daysRemaining
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check Stripe subscription status for paid users
    if (subscription.stripe_subscription_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        logStep("Stripe subscription retrieved", { status: stripeSub.status });
        
        const isActive = ['active', 'trialing'].includes(stripeSub.status);
        const subscriptionEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
        
        // Update local subscription status using admin client
        if (stripeSub.status !== subscription.status) {
          const newStatus = stripeSub.status === 'active' ? 'active' : 
                           stripeSub.status === 'canceled' ? 'canceled' :
                           stripeSub.status === 'past_due' ? 'past_due' : 'expired';
          
          await supabaseAdmin
            .from('subscriptions')
            .update({ 
              status: newStatus,
              subscription_end: subscriptionEnd
            })
            .eq('user_id', user.id);
        }

        return new Response(JSON.stringify({
          subscribed: isActive,
          status: stripeSub.status,
          subscription_end: subscriptionEnd,
          product_id: stripeSub.items.data[0]?.price?.product
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (stripeError) {
        logStep("Error retrieving Stripe subscription", { error: String(stripeError) });
      }
    }

    // Fallback to local status
    const isExpired = subscription.status === 'expired' || subscription.status === 'canceled';
    return new Response(JSON.stringify({
      subscribed: !isExpired,
      status: subscription.status,
      subscription_end: subscription.subscription_end
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
