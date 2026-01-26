import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    // Verify the requesting user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const requestingUserId = userData.user.id;
    logStep("User authenticated", { userId: requestingUserId });

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
          .select("user_id, status, trial_end, subscription_end");

        // Get all user roles
        const { data: userRoles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        // Combine data
        let users = authUsers.users.map((user) => {
          const profile = profiles?.find((p) => p.user_id === user.id);
          const subscription = subscriptions?.find((s) => s.user_id === user.id);
          const roles = userRoles?.filter((r) => r.user_id === user.id).map((r) => r.role) || [];

          return {
            id: user.id,
            email: user.email,
            fullName: profile?.full_name || null,
            businessName: profile?.business_name || null,
            createdAt: user.created_at,
            subscriptionStatus: subscription?.status || "unknown",
            trialEnd: subscription?.trial_end || null,
            subscriptionEnd: subscription?.subscription_end || null,
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
