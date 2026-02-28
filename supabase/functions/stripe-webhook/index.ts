import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Helper seguro para converter timestamp Stripe
function safeStripeDate(timestamp: number | undefined | null): string | null {
  if (!timestamp || isNaN(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

// Mapeamento de status Stripe → local
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    case 'unpaid': return 'expired';
    case 'incomplete': return 'pending';
    case 'incomplete_expired': return 'expired';
    case 'trialing': return 'trial';
    default: return 'expired';
  }
}

// Helper para encontrar user_id a partir de metadata ou stripe_customer_id
async function findUserId(
  supabaseAdmin: ReturnType<typeof createClient>,
  metadata: Record<string, string> | null | undefined,
  customerId: string | null
): Promise<{ userId: string | null; method: string }> {
  const metaUserId = metadata?.user_id;
  if (metaUserId) return { userId: metaUserId, method: 'metadata' };

  if (customerId) {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data?.user_id) return { userId: data.user_id, method: 'customer_id_lookup' };
  }

  return { userId: null, method: 'none' };
}

// Helper para extrair customer ID de objeto Stripe
function extractCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  if (typeof customer === 'string') return customer;
  return customer.id ?? null;
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
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = extractCustomerId(stripeSub.customer);
          const periodEnd = safeStripeDate(stripeSub.current_period_end);
          const { userId, method } = await findUserId(supabaseAdmin, stripeSub.metadata, customerId);

          const updateData = {
            status: 'active' as const,
            subscription_ends_at: periodEnd,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            manual_override: false,
          };

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update(updateData)
              .eq("user_id", userId);
            logStep("invoice.paid: Updated subscription", { userId, method });
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
          const customerId = extractCustomerId(stripeSub.customer);
          const { userId, method } = await findUserId(supabaseAdmin, stripeSub.metadata, customerId);

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update({ status: 'past_due' as const })
              .eq("user_id", userId);
            logStep("invoice.payment_failed: Set past_due", { userId, method });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = extractCustomerId(stripeSub.customer);
        const periodEnd = safeStripeDate(stripeSub.current_period_end);
        const localStatus = mapStripeStatus(stripeSub.status);
        const { userId, method } = await findUserId(supabaseAdmin, stripeSub.metadata, customerId);

        const updateData = {
          status: localStatus,
          subscription_ends_at: periodEnd,
          stripe_subscription_id: stripeSub.id,
          stripe_customer_id: customerId,
          manual_override: false,
        };

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          logStep(`${event.type}: Synced`, { userId, status: localStatus, method });
        } else {
          logStep(`${event.type}: No user_id found`, { customerId });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = extractCustomerId(stripeSub.customer);
        const { userId, method } = await findUserId(supabaseAdmin, stripeSub.metadata, customerId);

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: 'expired' as const, manual_override: false })
            .eq("user_id", userId);
          logStep("subscription.deleted: Set expired", { userId, method });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = extractCustomerId(session.customer);
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

        if (!userId) {
          logStep("checkout.completed: No user_id in metadata, skipping");
          break;
        }

        // Boleto: payment_status === 'unpaid' significa boleto gerado mas não pago
        if (session.payment_status === 'unpaid') {
          const updateData = {
            status: 'pending' as const,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId || null,
            manual_override: false,
          };
          await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          logStep("checkout.completed: Boleto pending", { userId });
          break;
        }

        // Pagamento imediato (cartão)
        if (subscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEnd = safeStripeDate(stripeSub.current_period_end);
            const localStatus = mapStripeStatus(stripeSub.status);

            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: localStatus,
                subscription_ends_at: periodEnd,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                manual_override: false,
              })
              .eq("user_id", userId);
            logStep("checkout.completed: Updated", { userId, status: localStatus });
          } catch (subErr) {
            // Se não conseguir buscar a subscription, ao menos salvar os IDs
            logStep("checkout.completed: Could not retrieve subscription, saving IDs", {
              error: subErr instanceof Error ? subErr.message : String(subErr),
            });
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: 'active' as const,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                manual_override: false,
              })
              .eq("user_id", userId);
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
