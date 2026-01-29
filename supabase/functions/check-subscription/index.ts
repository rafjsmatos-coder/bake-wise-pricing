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
      
      const { data: newSub, error: createError } = await supabaseAdmin
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

      const daysRemaining = 7;
      
      return new Response(
        JSON.stringify({
          status: 'trial',
          canAccess: true,
          trialEndsAt: trialEndsAt.toISOString(),
          subscriptionEndsAt: null,
          daysRemaining,
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
        // Trial expirou
        currentStatus = 'expired';
        canAccess = false;
        
        // Atualizar no banco
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: 'expired' })
          .eq("user_id", userId);
      }
    } else if (subscription.status === 'active') {
      const subEnds = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null;
      
      if (subEnds && subEnds > now) {
        canAccess = true;
        daysRemaining = Math.ceil((subEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        // Assinatura expirou
        currentStatus = 'expired';
        canAccess = false;
        
        // Atualizar no banco
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: 'expired' })
          .eq("user_id", userId);
      }
    } else if (subscription.status === 'pending') {
      // Pagamento pendente (boleto)
      canAccess = false;
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
        stripeCustomerId: subscription.stripe_customer_id,
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
