
-- Add view_count column to faq_items
ALTER TABLE public.faq_items ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create a function to increment view count (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_faq_view(item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE faq_items SET view_count = view_count + 1 WHERE id = item_id;
END;
$$;
