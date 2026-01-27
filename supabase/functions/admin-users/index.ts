import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { validateAuth, createAdminClient } from "../_shared/auth.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-USERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    logStep("Function started");

    // Use the new auth helper
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

    const requestingUserId = user.id;
    logStep("User authenticated", { userId: requestingUserId });

    // Use admin client for database operations
    const supabaseAdmin = createAdminClient();

    // Check if requesting user is admin
    const { data: adminCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminCheck) {
      throw new Error("Access denied: Admin role required");
    }
    logStep("Admin verified");

    const { action, ...params } = await req.json();
    logStep("Action requested", { action });

    switch (action) {
      case "list": {
        const { page = 1, perPage = 20, search = "", statusFilter = "" } = params;
        
        // Get all users from auth
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (listError) {
          throw new Error(`Failed to list users: ${listError.message}`);
        }

        // Get all profiles
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, full_name, business_name");

        // Get all subscriptions
        const { data: subscriptions } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, status, trial_end, subscription_end, stripe_customer_id, stripe_subscription_id");

        // Get all user roles
        const { data: userRoles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        // Combine data
        let users = authUsers.users.map((authUser) => {
          const profile = profiles?.find((p) => p.user_id === authUser.id);
          const subscription = subscriptions?.find((s) => s.user_id === authUser.id);
          const roles = userRoles?.filter((r) => r.user_id === authUser.id).map((r) => r.role) || [];

          return {
            id: authUser.id,
            email: authUser.email,
            fullName: profile?.full_name || null,
            businessName: profile?.business_name || null,
            createdAt: authUser.created_at,
            subscriptionStatus: subscription?.status || "unknown",
            trialEnd: subscription?.trial_end || null,
            subscriptionEnd: subscription?.subscription_end || null,
            stripeCustomerId: subscription?.stripe_customer_id || null,
            stripeSubscriptionId: subscription?.stripe_subscription_id || null,
            roles,
            isAdmin: roles.includes("admin"),
          };
        });

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          users = users.filter(
            (u) =>
              u.email?.toLowerCase().includes(searchLower) ||
              u.fullName?.toLowerCase().includes(searchLower) ||
              u.businessName?.toLowerCase().includes(searchLower)
          );
        }

        // Apply status filter
        if (statusFilter) {
          users = users.filter((u) => u.subscriptionStatus === statusFilter);
        }

        logStep("Users listed", { count: users.length });

        return new Response(
          JSON.stringify({
            users,
            total: authUsers.users.length,
            page,
            perPage,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "stats": {
        // Get subscription stats
        const { data: subscriptions } = await supabaseAdmin
          .from("subscriptions")
          .select("status, created_at");

        const stats = {
          total: subscriptions?.length || 0,
          trial: subscriptions?.filter((s) => s.status === "trial").length || 0,
          active: subscriptions?.filter((s) => s.status === "active").length || 0,
          expired: subscriptions?.filter((s) => s.status === "expired").length || 0,
          canceled: subscriptions?.filter((s) => s.status === "canceled").length || 0,
        };

        // Get users created per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = subscriptions
          ?.filter((s) => new Date(s.created_at) >= sixMonthsAgo)
          .reduce((acc: Record<string, number>, sub) => {
            const month = new Date(sub.created_at).toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {}) || {};

        const monthlyGrowth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));

        logStep("Stats retrieved", stats);

        return new Response(
          JSON.stringify({ stats, monthlyGrowth }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "toggleAdmin": {
        const { userId, makeAdmin } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        // Cannot modify own admin status
        if (userId === requestingUserId) {
          throw new Error("Cannot modify your own admin status");
        }

        if (makeAdmin) {
          // Add admin role
          const { error: insertError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: userId, role: "admin" });

          if (insertError && !insertError.message.includes("duplicate")) {
            throw new Error(`Failed to add admin role: ${insertError.message}`);
          }
          logStep("Admin role added", { userId });
        } else {
          // Remove admin role
          const { error: deleteError } = await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", userId)
            .eq("role", "admin");

          if (deleteError) {
            throw new Error(`Failed to remove admin role: ${deleteError.message}`);
          }
          logStep("Admin role removed", { userId });
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "getUserDetails": {
        const { userId } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        // Get user from auth
        const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authUserError || !authUser.user) {
          throw new Error("User not found");
        }

        // Get profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        // Get subscription
        const { data: subscription } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        // Get roles
        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        // Get data counts
        const [
          { count: ingredientsCount },
          { count: recipesCount },
          { count: productsCount },
          { count: packagingCount },
          { count: decorationsCount },
        ] = await Promise.all([
          supabaseAdmin.from("ingredients").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("recipes").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("packaging").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("decorations").select("*", { count: "exact", head: true }).eq("user_id", userId),
        ]);

        logStep("User details retrieved", { userId });

        return new Response(
          JSON.stringify({
            user: {
              id: authUser.user.id,
              email: authUser.user.email,
              createdAt: authUser.user.created_at,
              lastSignIn: authUser.user.last_sign_in_at,
            },
            profile,
            subscription,
            roles: roles?.map((r) => r.role) || [],
            dataCounts: {
              ingredients: ingredientsCount || 0,
              recipes: recipesCount || 0,
              products: productsCount || 0,
              packaging: packagingCount || 0,
              decorations: decorationsCount || 0,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "updateSubscription": {
        const { userId, status, trialEnd, subscriptionEnd, stripeCustomerId, stripeSubscriptionId, stripeProductId } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (trialEnd !== undefined) updateData.trial_end = trialEnd;
        if (subscriptionEnd !== undefined) updateData.subscription_end = subscriptionEnd;
        if (stripeCustomerId !== undefined) updateData.stripe_customer_id = stripeCustomerId || null;
        if (stripeSubscriptionId !== undefined) updateData.stripe_subscription_id = stripeSubscriptionId || null;
        if (stripeProductId !== undefined) updateData.stripe_product_id = stripeProductId || null;

        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        logStep("Subscription updated", { userId, ...updateData });

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "extendTrial": {
        const { userId, days } = params;

        if (!userId || !days) {
          throw new Error("User ID and days are required");
        }

        // Get current subscription
        const { data: subscription } = await supabaseAdmin
          .from("subscriptions")
          .select("trial_end")
          .eq("user_id", userId)
          .maybeSingle();

        if (!subscription) {
          throw new Error("Subscription not found");
        }

        // Calculate new trial end date
        const currentTrialEnd = new Date(subscription.trial_end);
        const now = new Date();
        const baseDate = currentTrialEnd > now ? currentTrialEnd : now;
        const newTrialEnd = new Date(baseDate);
        newTrialEnd.setDate(newTrialEnd.getDate() + parseInt(days));

        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "trial",
            trial_end: newTrialEnd.toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          throw new Error(`Failed to extend trial: ${updateError.message}`);
        }

        logStep("Trial extended", { userId, days, newTrialEnd: newTrialEnd.toISOString() });

        return new Response(
          JSON.stringify({ success: true, newTrialEnd: newTrialEnd.toISOString() }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "deleteUser": {
        const { userId } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        // Cannot delete yourself
        if (userId === requestingUserId) {
          throw new Error("Cannot delete your own account");
        }

        // Check if target user is admin
        const { data: targetRoles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (targetRoles) {
          throw new Error("Cannot delete another admin user");
        }

        // Delete user (cascade will handle related data)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          throw new Error(`Failed to delete user: ${deleteError.message}`);
        }

        logStep("User deleted", { userId });

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "getStripeInfo": {
        const { email, stripeCustomerId } = params;

        if (!email && !stripeCustomerId) {
          throw new Error("Email or Stripe Customer ID is required");
        }

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
          throw new Error("STRIPE_SECRET_KEY is not configured");
        }

        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        let customer = null;
        let subscriptions: Stripe.Subscription[] = [];
        let invoices: Stripe.Invoice[] = [];

        try {
          // Find customer by ID or email
          if (stripeCustomerId) {
            customer = await stripe.customers.retrieve(stripeCustomerId);
            if ((customer as Stripe.DeletedCustomer).deleted) {
              customer = null;
            }
          } else if (email) {
            const customers = await stripe.customers.list({ email, limit: 1 });
            customer = customers.data[0] || null;
          }

          if (customer && !(customer as Stripe.DeletedCustomer).deleted) {
            const activeCustomer = customer as Stripe.Customer;
            
            // Get subscriptions
            const subsResult = await stripe.subscriptions.list({
              customer: activeCustomer.id,
              limit: 5,
            });
            subscriptions = subsResult.data;

            // Get recent invoices
            const invoicesResult = await stripe.invoices.list({
              customer: activeCustomer.id,
              limit: 5,
            });
            invoices = invoicesResult.data;
          }

          logStep("Stripe info retrieved", { 
            customerId: customer && !(customer as Stripe.DeletedCustomer).deleted ? (customer as Stripe.Customer).id : null,
            subscriptionsCount: subscriptions.length,
            invoicesCount: invoices.length
          });

          return new Response(
            JSON.stringify({
              customer: customer && !(customer as Stripe.DeletedCustomer).deleted ? {
                id: (customer as Stripe.Customer).id,
                email: (customer as Stripe.Customer).email,
                created: (customer as Stripe.Customer).created,
                name: (customer as Stripe.Customer).name,
              } : null,
              subscriptions: subscriptions.map((sub) => ({
                id: sub.id,
                status: sub.status,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
                cancel_at_period_end: sub.cancel_at_period_end,
                plan: sub.items.data[0]?.price ? {
                  id: sub.items.data[0].price.id,
                  product: sub.items.data[0].price.product,
                  amount: sub.items.data[0].price.unit_amount,
                  currency: sub.items.data[0].price.currency,
                  interval: sub.items.data[0].price.recurring?.interval,
                } : null,
              })),
              invoices: invoices.map((inv) => ({
                id: inv.id,
                status: inv.status,
                amount_paid: inv.amount_paid,
                currency: inv.currency,
                created: inv.created,
                hosted_invoice_url: inv.hosted_invoice_url,
              })),
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } catch (stripeError) {
          logStep("Stripe error", { error: String(stripeError) });
          return new Response(
            JSON.stringify({
              customer: null,
              subscriptions: [],
              invoices: [],
              error: "Could not retrieve Stripe data",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }

      case "syncFromStripe": {
        const { userId, email, stripeCustomerId } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        if (!email && !stripeCustomerId) {
          throw new Error("Email or Stripe Customer ID is required");
        }

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
          throw new Error("STRIPE_SECRET_KEY is not configured");
        }

        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        try {
          let customer = null;

          // Find customer
          if (stripeCustomerId) {
            customer = await stripe.customers.retrieve(stripeCustomerId);
            if ((customer as Stripe.DeletedCustomer).deleted) {
              customer = null;
            }
          } else if (email) {
            const customers = await stripe.customers.list({ email, limit: 1 });
            customer = customers.data[0] || null;
          }

          if (!customer || (customer as Stripe.DeletedCustomer).deleted) {
            throw new Error("Customer not found in Stripe");
          }

          const activeCustomer = customer as Stripe.Customer;

          // Get active subscription
          const subsResult = await stripe.subscriptions.list({
            customer: activeCustomer.id,
            status: "active",
            limit: 1,
          });

          const updateData: Record<string, unknown> = {
            stripe_customer_id: activeCustomer.id,
          };

          if (subsResult.data.length > 0) {
            const sub = subsResult.data[0];
            updateData.status = "active";
            updateData.stripe_subscription_id = sub.id;
            updateData.stripe_product_id = sub.items.data[0]?.price?.product || null;
            updateData.subscription_start = new Date(sub.current_period_start * 1000).toISOString();
            updateData.subscription_end = new Date(sub.current_period_end * 1000).toISOString();
          } else {
            // No active subscription
            updateData.status = "expired";
            updateData.stripe_subscription_id = null;
          }

          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);

          if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
          }

          logStep("Synced from Stripe", { userId, ...updateData });

          return new Response(
            JSON.stringify({ success: true, data: updateData }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } catch (stripeError) {
          const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
          logStep("Sync error", { error: errorMessage });
          throw new Error(`Stripe sync failed: ${errorMessage}`);
        }
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
