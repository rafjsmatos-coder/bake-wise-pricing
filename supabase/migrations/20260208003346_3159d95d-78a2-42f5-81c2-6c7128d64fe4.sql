
-- Create system_updates table for announcements
CREATE TABLE public.system_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'improvement' CHECK (type IN ('feature', 'improvement', 'fix')),
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_update_views table to track last seen
CREATE TABLE public.user_update_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_update_views ENABLE ROW LEVEL SECURITY;

-- RLS for system_updates: admins can CRUD, authenticated users can read published
CREATE POLICY "Admins can manage system updates"
ON public.system_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read published updates"
ON public.system_updates
FOR SELECT
USING (is_published = true AND published_at IS NOT NULL);

-- RLS for user_update_views: users manage their own views
CREATE POLICY "Users can view their own update views"
ON public.user_update_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own update views"
ON public.user_update_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own update views"
ON public.user_update_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at on system_updates
CREATE TRIGGER update_system_updates_updated_at
BEFORE UPDATE ON public.system_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
