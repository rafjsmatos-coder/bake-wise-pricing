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
        const { page = 1, perPage = 20, search = "" } = params;
        
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

        // Get all user roles
        const { data: userRoles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        // Get all subscriptions
        const { data: subscriptions } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, status, trial_ends_at, subscription_ends_at");

        // Combine data
        let users = authUsers.users.map((authUser) => {
          const profile = profiles?.find((p) => p.user_id === authUser.id);
          const roles = userRoles?.filter((r) => r.user_id === authUser.id).map((r) => r.role) || [];
          const subscription = subscriptions?.find((s) => s.user_id === authUser.id);

          return {
            id: authUser.id,
            email: authUser.email,
            fullName: profile?.full_name || null,
            businessName: profile?.business_name || null,
            createdAt: authUser.created_at,
            roles,
            isAdmin: roles.includes("admin"),
            subscription: subscription ? {
              status: subscription.status,
              trialEndsAt: subscription.trial_ends_at,
              subscriptionEndsAt: subscription.subscription_ends_at,
            } : null,
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
        // Get total user count from auth
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (listError) {
          throw new Error(`Failed to get users for stats: ${listError.message}`);
        }

        const totalUsers = authUsers.users.length;

        // Get subscription stats
        const { data: subscriptions } = await supabaseAdmin
          .from("subscriptions")
          .select("status");

        const subscriptionStats = {
          trial: 0,
          active: 0,
          expired: 0,
          canceled: 0,
          pending: 0,
        };

        subscriptions?.forEach((sub) => {
          if (sub.status in subscriptionStats) {
            subscriptionStats[sub.status as keyof typeof subscriptionStats]++;
          }
        });

        // Get users created per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = authUsers.users
          .filter((u) => new Date(u.created_at) >= sixMonthsAgo)
          .reduce((acc: Record<string, number>, user) => {
            const month = new Date(user.created_at).toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});

        const monthlyGrowth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));

        const stats = {
          total: totalUsers,
          subscriptions: subscriptionStats,
        };

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

        // Get roles
        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        // Get subscription
        const { data: subscription } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        // Get data counts
        const [
          { count: ingredientsCount },
          { count: recipesCount },
          { count: productsCount },
          { count: packagingCount },
          { count: decorationsCount },
          { count: ordersCount },
          { count: clientsCount },
        ] = await Promise.all([
          supabaseAdmin.from("ingredients").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("recipes").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("packaging").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("decorations").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabaseAdmin.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId),
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
            roles: roles?.map((r) => r.role) || [],
            subscription,
            dataCounts: {
              ingredients: ingredientsCount || 0,
              recipes: recipesCount || 0,
              products: productsCount || 0,
              packaging: packagingCount || 0,
              decorations: decorationsCount || 0,
              orders: ordersCount || 0,
              clients: clientsCount || 0,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "updateProfile": {
        const { userId, fullName, businessName } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        const updateData: Record<string, unknown> = {};
        if (fullName !== undefined) updateData.full_name = fullName;
        if (businessName !== undefined) updateData.business_name = businessName;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("user_id", userId);

        if (updateError) {
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        logStep("Profile updated", { userId, ...updateData });

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "updateSubscription": {
        const { userId, status, daysToAdd } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        const updateData: Record<string, unknown> = {};
        
        if (status) {
          updateData.status = status;
        }

        // Se o admin está ativando premium manualmente, marca como override
        if (status === 'active') {
          updateData.manual_override = true;
          if (daysToAdd) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + daysToAdd);
            updateData.subscription_ends_at = endDate.toISOString();
          }
        }

        if (status === 'trial' && daysToAdd) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + daysToAdd);
          updateData.trial_ends_at = endDate.toISOString();
          // Trial manual também é um override
          updateData.manual_override = true;
        }

        // Se o status for expired ou canceled, remove o override
        if (status === 'expired' || status === 'canceled') {
          updateData.manual_override = false;
        }

        // Check if subscription exists
        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingSub) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("user_id", userId);

          if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
          }
        } else {
          // Create new subscription
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + (daysToAdd || 7));
          
          const { error: insertError } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              status: status || 'trial',
              trial_ends_at: trialEndsAt.toISOString(),
              manual_override: status === 'active',
              ...updateData,
            });

          if (insertError) {
            throw new Error(`Failed to create subscription: ${insertError.message}`);
          }
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
          .select("trial_ends_at, status")
          .eq("user_id", userId)
          .maybeSingle();

        let newTrialEnd: Date;
        
        if (subscription?.trial_ends_at) {
          const currentEnd = new Date(subscription.trial_ends_at);
          // Se a data já passou, começar de agora
          if (currentEnd < new Date()) {
            newTrialEnd = new Date();
          } else {
            newTrialEnd = currentEnd;
          }
        } else {
          newTrialEnd = new Date();
        }
        
        newTrialEnd.setDate(newTrialEnd.getDate() + days);

        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({ 
            trial_ends_at: newTrialEnd.toISOString(),
            status: 'trial',
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

      case "syncFromStripe": {
        const { userId } = params;

        if (!userId) {
          throw new Error("User ID is required");
        }

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
          throw new Error("STRIPE_SECRET_KEY is not set");
        }

        // Get user email
        const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authUserError || !authUser.user?.email) {
          throw new Error("User not found or no email");
        }

        // Get current subscription to check manual_override and trial status
        const { data: currentSub } = await supabaseAdmin
          .from("subscriptions")
          .select("manual_override, status, trial_ends_at")
          .eq("user_id", userId)
          .maybeSingle();
        
        // Helper: Check if user has active trial
        const hasActiveTrial = (): boolean => {
          if (currentSub?.status !== 'trial') return false;
          if (!currentSub?.trial_ends_at) return false;
          return new Date(currentSub.trial_ends_at) > new Date();
        };

        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        // Find customer in Stripe
        const customers = await stripe.customers.list({ email: authUser.user.email, limit: 1 });
        
        if (customers.data.length === 0) {
          // Sem cliente no Stripe
          if (currentSub?.manual_override) {
            // Se foi ativado manualmente, mantém como está
            logStep("No Stripe customer, but manual override is active - keeping current status", { userId });
            return new Response(
              JSON.stringify({ success: true, message: "Ativação manual mantida (sem cliente no Stripe)" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }
          return new Response(
            JSON.stringify({ success: true, message: "Nenhum cliente encontrado no Stripe" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }

        const customerId = customers.data[0].id;

        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          const endDate = new Date(sub.current_period_end * 1000);

          // Assinatura ativa no Stripe - sincroniza e remove override manual
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              subscription_ends_at: endDate.toISOString(),
              manual_override: false, // Agora é gerenciado pelo Stripe
            })
            .eq("user_id", userId);

          logStep("Synced active subscription from Stripe", { userId, subscriptionId: sub.id });
          
          return new Response(
            JSON.stringify({ success: true, message: "Assinatura ativa sincronizada do Stripe" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } else {
          // Sem assinatura ativa no Stripe
          if (currentSub?.manual_override) {
            // Se foi ativado manualmente, mantém status mas atualiza customer ID
            await supabaseAdmin
              .from("subscriptions")
              .update({ stripe_customer_id: customerId })
              .eq("user_id", userId);

            logStep("No active Stripe subscription, but manual override - keeping status", { userId, customerId });
            
            return new Response(
              JSON.stringify({ success: true, message: "Ativação manual mantida (sem assinatura ativa no Stripe)" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          } else if (hasActiveTrial()) {
            // User has active trial - preserve it, just update customer ID
            await supabaseAdmin
              .from("subscriptions")
              .update({ stripe_customer_id: customerId })
              .eq("user_id", userId);

            logStep("No active Stripe subscription, but user has active trial - keeping trial", { userId, customerId });
            
            return new Response(
              JSON.stringify({ success: true, message: "Trial ativo mantido (sem assinatura no Stripe)" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          } else {
            // No override, no active trial - revert to expired
            await supabaseAdmin
              .from("subscriptions")
              .update({ 
                stripe_customer_id: customerId,
                status: 'expired',
                stripe_subscription_id: null,
              })
              .eq("user_id", userId);

            logStep("No active subscription in Stripe, no trial, reverted to expired", { userId, customerId });
            
            return new Response(
              JSON.stringify({ success: true, message: "Sem assinatura ativa no Stripe - status alterado para expirado" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }
        }
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
        status: 500,
      }
    );
  }
});