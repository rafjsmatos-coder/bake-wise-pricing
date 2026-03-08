import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Preço do PreciBake Premium - R$ 49,90/mês
const PRICE_ID = "price_1StDnC1UfMJqJ1ycnqShIkOZ";

// Cupom de lançamento: R$20 off no primeiro mês (R$29,90), limitado a 25 resgates
const PROMO_COUPON_ID = "d9LqbCVP";
const PROMO_SLOTS_TOTAL = 25;

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

    const { user, error: authError } = await validateAuth(req);
    
    if (authError || !user) {
      logStep("Authentication failed", { error: authError });
      return new Response(
        JSON.stringify({ error: authError || "Authentication failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    if (!user.email) {
      throw new Error("User email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseAdmin = createAdminClient();

    // Verificar/criar customer no Stripe
    let customerId: string | undefined;
    
    // Primeiro, verificar se já temos o customer_id no banco
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
      logStep("Found existing customer ID in database", { customerId });
    } else {
      // Buscar no Stripe pelo email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found customer in Stripe", { customerId });
        
        // Salvar no banco para futuras consultas
        await supabaseAdmin
          .from("subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
      }
    }

    logStep("Creating checkout session", { customerId, priceId: PRICE_ID });

    // Criar sessão de checkout com suporte a cartão e boleto
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      locale: 'pt-BR',
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
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
