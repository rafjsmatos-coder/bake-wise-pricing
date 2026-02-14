import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures there is an active auth session before performing mutations.
 * Returns the user ID from the session.
 * Refreshes the session if needed.
 */
export async function ensureSessionUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;

  // Try refreshing
  const { data: { session: refreshed } } = await supabase.auth.refreshSession();
  if (refreshed?.user?.id) return refreshed.user.id;

  throw new Error('Sessão expirada. Faça login novamente.');
}
