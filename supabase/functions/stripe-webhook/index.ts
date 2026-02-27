import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Mapeamento de status Stripe → local
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    case 'unpaid': return 'expired';
    case 'incomplete': return 'pending';
    case 'incomplete_expired': return 'expired';
    default: return 'expired';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      logStep("Missing required secrets");
      return new Response("Server configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("No stripe-signature header");
      return new Response("No signature", { status: 400 });
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logStep("Signature verification failed", { error: msg });
      return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Admin client para operações no banco
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Idempotência: verificar se já processou este evento
    const { data: existing } = await supabaseAdmin
      .from("webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existing) {
      logStep("Event already processed, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Processar evento
    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

        if (subscriptionId) {
          // Buscar subscription no Stripe para obter dados atualizados
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = stripeSub.metadata?.user_id;
          const customerId = typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer?.id;
          const periodEnd = new Date(stripeSub.current_period_end * 1000);

          const updateData = {
            status: 'active' as const,
            subscription_ends_at: periodEnd.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            manual_override: false,
          };

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("user_id", userId);
            logStep("invoice.paid: Updated subscription via user_id", { userId });
          } else if (customerId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("stripe_customer_id", customerId);
            logStep("invoice.paid: Updated subscription via customer_id", { customerId });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

        if (subscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = stripeSub.metadata?.user_id;
          const customerId = typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer?.id;

          const updateData = { status: 'past_due' as const };

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("user_id", userId);
            logStep("invoice.payment_failed: Set past_due via user_id", { userId });
          } else if (customerId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("stripe_customer_id", customerId);
            logStep("invoice.payment_failed: Set past_due via customer_id", { customerId });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.user_id;
        const customerId = typeof stripeSub.customer === 'string'
          ? stripeSub.customer
          : stripeSub.customer?.id;
        const periodEnd = new Date(stripeSub.current_period_end * 1000);
        const localStatus = mapStripeStatus(stripeSub.status);

        const updateData = {
          status: localStatus,
          subscription_ends_at: periodEnd.toISOString(),
          stripe_subscription_id: stripeSub.id,
          stripe_customer_id: customerId,
          manual_override: false,
        };

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          logStep("subscription.updated: Synced via user_id", { userId, status: localStatus });
        } else if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("stripe_customer_id", customerId);
          logStep("subscription.updated: Synced via customer_id", { customerId, status: localStatus });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.user_id;
        const customerId = typeof stripeSub.customer === 'string'
          ? stripeSub.customer
          : stripeSub.customer?.id;

        const updateData = {
          status: 'expired' as const,
          manual_override: false,
        };

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          logStep("subscription.deleted: Set expired via user_id", { userId });
        } else if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("stripe_customer_id", customerId);
          logStep("subscription.deleted: Set expired via customer_id", { customerId });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

        if (subscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(stripeSub.current_period_end * 1000);
          const localStatus = mapStripeStatus(stripeSub.status);

          const updateData = {
            status: localStatus,
            subscription_ends_at: periodEnd.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            manual_override: false,
          };

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("user_id", userId);
            logStep("checkout.completed: Updated via user_id", { userId, status: localStatus });
          } else if (customerId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("stripe_customer_id", customerId);
            logStep("checkout.completed: Updated via customer_id", { customerId, status: localStatus });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    // Registrar evento processado
    await supabaseAdmin
      .from("webhook_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      });

    logStep("Event processed successfully", { eventId: event.id });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
