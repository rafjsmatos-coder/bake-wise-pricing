-- Drop the overly permissive policy for service role
-- Edge functions use service role key which bypasses RLS, so this policy is not needed
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscriptions;