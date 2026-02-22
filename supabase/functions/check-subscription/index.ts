import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    logStep("Function started");

    const { user, error: authError } = await validateAuth(req);
    
    if (authError || !user) {
      logStep("Authentication failed", { error: authError });
      return new Response(
        JSON.stringify({ error: authError || "Authentication failed", code: "unauthenticated" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const userId = user.id;
    const userEmail = user.email;
    logStep("User authenticated", { userId });

    const supabaseAdmin = createAdminClient();

    // Buscar assinatura do usuário
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      logStep("Error fetching subscription", { error: subError.message });
      throw new Error(`Failed to fetch subscription: ${subError.message}`);
    }

    // Se não tem assinatura, criar uma trial
    if (!subscription) {
      logStep("No subscription found, creating trial");
      
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      const { error: createError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: userId,
          status: 'trial',
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        logStep("Error creating trial", { error: createError.message });
        throw new Error(`Failed to create trial: ${createError.message}`);
      }

      return new Response(
        JSON.stringify({
          status: 'trial',
          canAccess: true,
          trialEndsAt: trialEndsAt.toISOString(),
          subscriptionEndsAt: null,
          daysRemaining: 7,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calcular status atual
    const now = new Date();
    let currentStatus = subscription.status;
    let canAccess = false;
    let daysRemaining: number | null = null;

    if (subscription.status === 'trial') {
      const trialEnds = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
      
      if (trialEnds && trialEnds > now) {
        canAccess = true;
        daysRemaining = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        currentStatus = 'expired';
        canAccess = false;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: 'expired', manual_override: false })
          .eq("user_id", userId);
      }
    } else if (subscription.status === 'active') {
      const subEnds = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null;
      
      if (subEnds && subEnds > now) {
        canAccess = true;
        daysRemaining = Math.ceil((subEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        currentStatus = 'expired';
        canAccess = false;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: 'expired', manual_override: false })
          .eq("user_id", userId);
      }
    } else if (subscription.status === 'pending') {
      canAccess = false;
    }

    // FALLBACK: Se expired, consultar Stripe para detectar assinaturas ativas não sincronizadas
    if (currentStatus === 'expired' && !subscription.manual_override && userEmail) {
      logStep("Status expired, checking Stripe fallback", { email: userEmail });
      
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
          const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
          
          if (customers.data.length > 0) {
            const customerId = customers.data[0].id;
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              status: 'active',
              limit: 1,
            });
            
            if (subscriptions.data.length > 0) {
              const stripeSub = subscriptions.data[0];
              const subEnd = new Date(stripeSub.current_period_end * 1000);
              
              logStep("Found active Stripe subscription, syncing", {
                stripeSubId: stripeSub.id,
                endDate: subEnd.toISOString(),
              });
              
              // Atualizar banco com dados do Stripe
              await supabaseAdmin
                .from("subscriptions")
                .update({
                  status: 'active',
                  stripe_customer_id: customerId,
                  stripe_subscription_id: stripeSub.id,
                  subscription_ends_at: subEnd.toISOString(),
                  manual_override: false,
                })
                .eq("user_id", userId);
              
              currentStatus = 'active';
              canAccess = true;
              daysRemaining = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            } else {
              logStep("No active Stripe subscription found");
            }
          } else {
            logStep("No Stripe customer found for email");
          }
        }
      } catch (stripeErr) {
        // Não falhar a função inteira se o fallback Stripe falhar
        logStep("Stripe fallback error (non-fatal)", { 
          error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr) 
        });
      }
    }

    logStep("Subscription status", { 
      status: currentStatus, 
      canAccess, 
      daysRemaining 
    });

    return new Response(
      JSON.stringify({
        status: currentStatus,
        canAccess,
        trialEndsAt: subscription.trial_ends_at,
        subscriptionEndsAt: subscription.subscription_ends_at,
        daysRemaining,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
