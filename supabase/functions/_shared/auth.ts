import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface AuthResult {
  user: {
    id: string;
    email: string;
  } | null;
  error: string | null;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTH] ${step}${detailsStr}`);
};

/**
 * Validates a JWT token and returns the user information.
 * Uses getClaims() which is more reliable in Edge Functions than getUser().
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    logStep("No authorization header");
    return { user: null, error: "No authorization header provided" };
  }

  if (!authHeader.startsWith("Bearer ")) {
    logStep("Invalid authorization format");
    return { user: null, error: "Invalid authorization format" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!token || token.length < 10) {
    logStep("Token too short or empty");
    return { user: null, error: "Invalid token" };
  }

  logStep("Token received", { tokenLength: token.length });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    logStep("Missing Supabase environment variables");
    return { user: null, error: "Server configuration error" };
  }

  // Create client with the user's token for getClaims
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    // Use getClaims which is more reliable in Edge Functions
    const { data, error } = await supabase.auth.getClaims(token);
    
    if (error) {
      logStep("getClaims error", { error: error.message });
      return { user: null, error: `Authentication failed: ${error.message}` };
    }

    if (!data?.claims) {
      logStep("No claims in token");
      return { user: null, error: "Invalid token claims" };
    }

    const userId = data.claims.sub as string;
    const email = data.claims.email as string;

    if (!userId) {
      logStep("No user ID in claims");
      return { user: null, error: "Invalid token: no user ID" };
    }

    logStep("User authenticated via getClaims", { userId, email: email || 'N/A' });

    return {
      user: {
        id: userId,
        email: email || '',
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("Authentication exception", { error: errorMessage });
    return { user: null, error: `Authentication error: ${errorMessage}` };
  }
}

/**
 * Creates an admin Supabase client with service role key.
 * Use this for database operations that bypass RLS.
 */
export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
}
