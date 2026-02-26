
-- Rate limiting table for send-auth-email
CREATE TABLE public.auth_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  action text NOT NULL,
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_auth_rate_limits_email_action ON public.auth_rate_limits (email, action, created_at);
CREATE INDEX idx_auth_rate_limits_ip ON public.auth_rate_limits (ip, created_at);

-- NO RLS - this table is only accessed by edge functions via service role
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Cleanup function to keep table small
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.auth_rate_limits WHERE created_at < NOW() - INTERVAL '15 minutes';
$$;
