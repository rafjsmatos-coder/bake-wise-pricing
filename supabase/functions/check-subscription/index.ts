import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Helper seguro para converter timestamp Stripe
function safeStripeDate(timestamp: number | undefined | null): string | null {
  if (!timestamp || isNaN(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

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
      logStep("Status pending (boleto awaiting payment)");
    }

    // FALLBACK: Consultar Stripe para detectar assinaturas não sincronizadas
    // Roda quando: (1) status expired sem override, ou (2) status trial/pending com stripe_customer_id
    const shouldFallback = 
      (currentStatus === 'expired' && !subscription.manual_override) ||
      ((subscription.status === 'trial' || subscription.status === 'pending') && subscription.stripe_customer_id);

    if (shouldFallback && userEmail) {
      logStep("Running Stripe fallback", { localStatus: currentStatus, email: userEmail });
      
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
          
          // Buscar customer pelo stripe_customer_id salvo ou pelo email
          let customerId = subscription.stripe_customer_id;
          if (!customerId) {
            const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (customers.data.length > 0) {
              customerId = customers.data[0].id;
            }
          }
          
          if (customerId) {
            // Buscar TODAS as subscriptions (sem filtrar por status)
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              limit: 5,
            });
            
            // Priorizar: active > past_due > incomplete > trialing
            const priorityOrder = ['active', 'past_due', 'incomplete', 'trialing'];
            let bestSub: Stripe.Subscription | null = null;
            
            for (const priority of priorityOrder) {
              bestSub = subscriptions.data.find(s => s.status === priority) || null;
              if (bestSub) break;
            }
            
            if (bestSub) {
              const subEnd = safeStripeDate(bestSub.current_period_end);
              const localStatus = bestSub.status === 'active' ? 'active' 
                : bestSub.status === 'past_due' ? 'past_due'
                : bestSub.status === 'incomplete' ? 'pending'
                : bestSub.status === 'trialing' ? 'trial'
                : 'expired';
              
              logStep("Found Stripe subscription, syncing", {
                stripeSubId: bestSub.id,
                stripeStatus: bestSub.status,
                localStatus,
                endDate: subEnd,
              });
              
              await supabaseAdmin
                .from("subscriptions")
                .update({
                  status: localStatus,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: bestSub.id,
                  subscription_ends_at: subEnd,
                  manual_override: false,
                })
                .eq("user_id", userId);
              
              currentStatus = localStatus;
              
              if (localStatus === 'active') {
                canAccess = true;
                if (subEnd) {
                  const subEndDate = new Date(subEnd);
                  daysRemaining = Math.ceil((subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
              } else if (localStatus === 'past_due') {
                if (subEnd) {
                  const subEndDate = new Date(subEnd);
                  const gracePeriodEnd = new Date(subEndDate.getTime() + GRACE_PERIOD_MS);
                  if (gracePeriodEnd > now) {
                    canAccess = true;
                    daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  }
                }
              } else if (localStatus === 'pending') {
                canAccess = false;
              }
            } else {
              logStep("No relevant Stripe subscription found");
            }
          } else {
            logStep("No Stripe customer found");
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
