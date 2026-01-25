import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// SECURITY: Webhook endpoints don't need CORS as they're called server-to-server by Stripe
// We only include minimal headers for preflight compatibility
const webhookHeaders = {
  "Content-Type": "application/json",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Webhooks are server-to-server, OPTIONS not needed but included for compatibility
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: String(err) });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: webhookHeaders,
        });
      }
    } else {
      // For development/testing without signature verification
      event = JSON.parse(body);
      logStep("Webhook received without signature verification (development mode)");
    }

    logStep("Event type", { type: event.type });

    const handleSubscriptionUpdate = async (subscription: Stripe.Subscription) => {
      const customerId = subscription.customer as string;
      const userId = subscription.metadata?.user_id;
      
      logStep("Processing subscription", { 
        subscriptionId: subscription.id, 
        customerId, 
        userId,
        status: subscription.status 
      });

      // If we don't have user_id in metadata, try to find by customer email
      let targetUserId = userId;
      
      if (!targetUserId) {
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer && customer.email) {
          const { data: users } = await supabaseClient.auth.admin.listUsers();
          const user = users.users.find(u => u.email === customer.email);
          if (user) {
            targetUserId = user.id;
            logStep("Found user by email", { email: customer.email, userId: targetUserId });
          }
        }
      }

      if (!targetUserId) {
        logStep("Could not find user for subscription", { subscriptionId: subscription.id });
        return;
      }

      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0]?.price?.product as string;
      
      let status: string;
      switch (subscription.status) {
        case 'active':
          status = 'active';
          break;
        case 'canceled':
          status = 'canceled';
          break;
        case 'past_due':
          status = 'past_due';
          break;
        case 'trialing':
          status = 'active'; // Stripe trial, not our app trial
          break;
        default:
          status = 'expired';
      }

      const { error } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: targetUserId,
          status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_product_id: productId,
          subscription_start: new Date(subscription.start_date * 1000).toISOString(),
          subscription_end: subscriptionEnd,
        }, { onConflict: 'user_id' });

      if (error) {
        logStep("Error updating subscription in database", { error: error.message });
      } else {
        logStep("Subscription updated in database", { userId: targetUserId, status });
      }
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, subscriptionId: session.subscription });
        
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await handleSubscriptionUpdate(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.user_id;

        let targetUserId = userId;
        
        if (!targetUserId) {
          const customer = await stripe.customers.retrieve(customerId);
          if ('email' in customer && customer.email) {
            const { data: users } = await supabaseClient.auth.admin.listUsers();
            const user = users.users.find(u => u.email === customer.email);
            if (user) targetUserId = user.id;
          }
        }

        if (targetUserId) {
          await supabaseClient
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('user_id', targetUserId);
          
          logStep("Subscription canceled in database", { userId: targetUserId });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;
          
          if (userId) {
            await supabaseClient
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', userId);
            
            logStep("Subscription marked as past_due", { userId });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: webhookHeaders,
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: webhookHeaders,
      status: 500,
    });
  }
});
