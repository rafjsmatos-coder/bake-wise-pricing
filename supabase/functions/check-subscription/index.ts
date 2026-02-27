import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Carência de 3 dias para past_due (boleto)
const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
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
    } else if (subscription.status === 'past_due') {
      // Carência de 3 dias para boleto: permitir acesso temporário
      const subEnds = subscription.subscription_ends_at
        ? new Date(subscription.subscription_ends_at)
        : null;

      if (subEnds) {
        const gracePeriodEnd = new Date(subEnds.getTime() + GRACE_PERIOD_MS);
        if (gracePeriodEnd > now) {
          canAccess = true;
          daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          logStep("past_due within grace period", { daysRemaining });
        } else {
          canAccess = false;
          currentStatus = 'expired';
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: 'expired', manual_override: false })
            .eq("user_id", userId);
          logStep("past_due grace period expired, setting to expired");
        }
      } else {
        canAccess = false;
        logStep("past_due without subscription_ends_at, blocking access");
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
            // Buscar qualquer subscription ativa ou past_due
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              limit: 1,
            });
            
            const activeSub = subscriptions.data.find(s => 
              s.status === 'active' || s.status === 'past_due'
            );
            
            if (activeSub) {
              const subEnd = new Date(activeSub.current_period_end * 1000);
              const localStatus = activeSub.status === 'active' ? 'active' : 'past_due';
              
              logStep("Found Stripe subscription, syncing", {
                stripeSubId: activeSub.id,
                status: localStatus,
                endDate: subEnd.toISOString(),
              });
              
              await supabaseAdmin
                .from("subscriptions")
                .update({
                  status: localStatus,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: activeSub.id,
                  subscription_ends_at: subEnd.toISOString(),
                  manual_override: false,
                })
                .eq("user_id", userId);
              
              currentStatus = localStatus;
              
              if (localStatus === 'active') {
                canAccess = true;
                daysRemaining = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              } else {
                // past_due — aplicar carência
                const gracePeriodEnd = new Date(subEnd.getTime() + GRACE_PERIOD_MS);
                if (gracePeriodEnd > now) {
                  canAccess = true;
                  daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                } else {
                  canAccess = false;
                }
              }
            } else {
              logStep("No active/past_due Stripe subscription found");
            }
          } else {
            logStep("No Stripe customer found for email");
          }
        }
      } catch (stripeErr) {
        logStep("Stripe fallback error (non-fatal)", { 
          error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr) 
        });
      }
    }

    logStep("Subscription status", { status: currentStatus, canAccess, daysRemaining });

    return new Response(
      JSON.stringify({
        status: currentStatus,
        canAccess,
        trialEndsAt: subscription.trial_ends_at,
        subscriptionEndsAt: subscription.subscription_ends_at,
        daysRemaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...getCorsHeaders(req.headers.get('origin')), "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
