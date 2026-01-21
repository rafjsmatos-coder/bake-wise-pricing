-- Create product_categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product categories" 
ON public.product_categories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product categories" 
ON public.product_categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product categories" 
ON public.product_categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product categories" 
ON public.product_categories FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for default product categories
CREATE OR REPLACE FUNCTION public.create_default_product_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.product_categories (user_id, name, color) VALUES
    (NEW.user_id, 'Bolos Decorados', '#f59e0b'),
    (NEW.user_id, 'Cupcakes', '#ec4899'),
    (NEW.user_id, 'Doces Finos', '#3b82f6'),
    (NEW.user_id, 'Kits Festa', '#22c55e'),
    (NEW.user_id, 'Tortas', '#a855f7'),
    (NEW.user_id, 'Encomendas Especiais', '#ef4444'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create default product categories for new users
CREATE TRIGGER on_profile_created_product_categories
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_product_categories();

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  decoration_time_minutes INTEGER DEFAULT 0,
  profit_margin_percent NUMERIC DEFAULT 30,
  additional_costs NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" 
ON public.products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create product_recipes junction table
CREATE TABLE public.product_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_recipes
CREATE POLICY "Users can view their product recipes" 
ON public.product_recipes FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_recipes.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can create their product recipes" 
ON public.product_recipes FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_recipes.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can update their product recipes" 
ON public.product_recipes FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_recipes.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can delete their product recipes" 
ON public.product_recipes FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_recipes.product_id AND products.user_id = auth.uid()));

-- Create product_ingredients junction table (for loose ingredients)
CREATE TABLE public.product_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit public.measurement_unit NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_ingredients
CREATE POLICY "Users can view their product ingredients" 
ON public.product_ingredients FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_ingredients.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can create their product ingredients" 
ON public.product_ingredients FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_ingredients.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can update their product ingredients" 
ON public.product_ingredients FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_ingredients.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can delete their product ingredients" 
ON public.product_ingredients FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_ingredients.product_id AND products.user_id = auth.uid()));

-- Create product_decorations junction table
CREATE TABLE public.product_decorations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  decoration_id UUID NOT NULL REFERENCES public.decorations(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit public.measurement_unit NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_decorations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_decorations
CREATE POLICY "Users can view their product decorations" 
ON public.product_decorations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_decorations.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can create their product decorations" 
ON public.product_decorations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_decorations.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can update their product decorations" 
ON public.product_decorations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_decorations.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can delete their product decorations" 
ON public.product_decorations FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_decorations.product_id AND products.user_id = auth.uid()));

-- Create product_packaging junction table
CREATE TABLE public.product_packaging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  packaging_id UUID NOT NULL REFERENCES public.packaging(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_packaging ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_packaging
CREATE POLICY "Users can view their product packaging" 
ON public.product_packaging FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_packaging.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can create their product packaging" 
ON public.product_packaging FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_packaging.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can update their product packaging" 
ON public.product_packaging FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_packaging.product_id AND products.user_id = auth.uid()));

CREATE POLICY "Users can delete their product packaging" 
ON public.product_packaging FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_packaging.product_id AND products.user_id = auth.uid()));