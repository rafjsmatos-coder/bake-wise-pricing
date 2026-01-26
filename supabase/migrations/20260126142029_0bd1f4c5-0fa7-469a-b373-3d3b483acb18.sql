-- Create the missing production_material_categories table
-- This table is referenced by a trigger but doesn't exist

CREATE TABLE public.production_material_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.production_material_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own production material categories"
  ON public.production_material_categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own production material categories"
  ON public.production_material_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production material categories"
  ON public.production_material_categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production material categories"
  ON public.production_material_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_production_material_categories_updated_at
  BEFORE UPDATE ON public.production_material_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();