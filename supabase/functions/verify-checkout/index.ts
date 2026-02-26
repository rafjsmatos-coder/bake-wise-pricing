import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const { session_id } = await req.json();
    
    if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_') || session_id.length > 255) {
      throw new Error("session_id is required and must be a valid Stripe checkout session ID");
    }

    logStep("Verifying checkout session", { sessionId: session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseAdmin = createAdminClient();

    // Buscar sessão de checkout com metadados
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    // Obter user_id dos metadados da sessão (definido no create-checkout)
    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error("user_id not found in session metadata");
    }

    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status,
      customerId: session.customer,
      userId,
    });

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      if (session.payment_status === 'unpaid') {
        // Pagamento pendente (boleto)
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: 'pending',
            stripe_customer_id: session.customer as string,
          })
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            success: false,
            status: 'pending',
            message: 'Aguardando confirmação do pagamento',
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      throw new Error("Payment not completed");
    }

    // Pagamento confirmado
    const subscription = session.subscription as Stripe.Subscription;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    logStep("Payment confirmed, updating subscription", {
      subscriptionId: subscription.id,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    });

    // Atualizar assinatura no banco
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_ends_at: currentPeriodEnd.toISOString(),
        manual_override: false,
      })
      .eq("user_id", userId);

    if (updateError) {
      logStep("Error updating subscription", { error: updateError.message });
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Subscription activated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        status: 'active',
        subscriptionEndsAt: currentPeriodEnd.toISOString(),
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
