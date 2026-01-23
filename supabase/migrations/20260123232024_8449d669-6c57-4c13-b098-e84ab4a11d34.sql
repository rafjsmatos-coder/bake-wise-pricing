-- Create production_material_categories table
CREATE TABLE public.production_material_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_material_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for production_material_categories
CREATE POLICY "Users can view their own production material categories"
ON public.production_material_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own production material categories"
ON public.production_material_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production material categories"
ON public.production_material_categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production material categories"
ON public.production_material_categories FOR DELETE
USING (auth.uid() = user_id);

-- Create production_materials table
CREATE TABLE public.production_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  package_quantity NUMERIC NOT NULL,
  unit public.measurement_unit NOT NULL,
  category_id UUID REFERENCES public.production_material_categories(id) ON DELETE SET NULL,
  brand TEXT,
  supplier TEXT,
  stock_quantity NUMERIC,
  min_stock_alert NUMERIC,
  cost_per_unit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for production_materials
CREATE POLICY "Users can view their own production materials"
ON public.production_materials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own production materials"
ON public.production_materials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production materials"
ON public.production_materials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production materials"
ON public.production_materials FOR DELETE
USING (auth.uid() = user_id);

-- Create product_materials junction table
CREATE TABLE public.product_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.production_materials(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_materials
CREATE POLICY "Users can view their product materials"
ON public.product_materials FOR SELECT
USING (EXISTS (
  SELECT 1 FROM products
  WHERE products.id = product_materials.product_id
  AND products.user_id = auth.uid()
));

CREATE POLICY "Users can create their product materials"
ON public.product_materials FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM products
  WHERE products.id = product_materials.product_id
  AND products.user_id = auth.uid()
));

CREATE POLICY "Users can update their product materials"
ON public.product_materials FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM products
  WHERE products.id = product_materials.product_id
  AND products.user_id = auth.uid()
));

CREATE POLICY "Users can delete their product materials"
ON public.product_materials FOR DELETE
USING (EXISTS (
  SELECT 1 FROM products
  WHERE products.id = product_materials.product_id
  AND products.user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_production_material_categories_updated_at
BEFORE UPDATE ON public.production_material_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_materials_updated_at
BEFORE UPDATE ON public.production_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default production material categories
CREATE OR REPLACE FUNCTION public.create_default_production_material_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.production_material_categories (user_id, name, color) VALUES
    (NEW.user_id, 'Descartáveis', '#f59e0b'),
    (NEW.user_id, 'EPIs', '#ec4899'),
    (NEW.user_id, 'Utensílios Descartáveis', '#3b82f6'),
    (NEW.user_id, 'Papéis e Filmes', '#22c55e'),
    (NEW.user_id, 'Limpeza', '#a855f7'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$function$;

-- Trigger to create default categories when a new profile is created
CREATE TRIGGER on_profile_created_create_production_material_categories
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_production_material_categories();