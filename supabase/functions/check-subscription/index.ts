import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    logStep("Function started");

    // Use the new auth helper
    const { user, error: authError } = await validateAuth(req);
    
    if (authError || !user) {
      logStep("Authentication failed", { error: authError });
      return new Response(JSON.stringify({ 
        subscribed: false, 
        status: 'expired',
        error: authError || "Not authenticated",
        code: "unauthenticated"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 to avoid error noise in frontend
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Use admin client for database operations
    const supabaseAdmin = createAdminClient();

    // Get subscription from database
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

    logStep("Subscription found", { status: subscription.status });

    // SIMPLIFIED: Trust only the database status (managed by admin)
    // No more Stripe API calls here - admin manages status manually

    // Check trial status
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 0) {
        // Trial expired - update status
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

    // For active subscriptions, trust the database status
    if (subscription.status === 'active') {
      logStep("Active subscription from database");
      return new Response(JSON.stringify({
        subscribed: true,
        status: 'active',
        subscription_end: subscription.subscription_end,
        product_id: subscription.stripe_product_id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For expired/canceled, deny access
    const isExpired = subscription.status === 'expired' || subscription.status === 'canceled';
    logStep("Subscription status", { status: subscription.status, isExpired });
    
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
