-- Create recipe_categories table (separate from ingredient categories)
CREATE TABLE public.recipe_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for recipe_categories
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipe categories" ON public.recipe_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recipe categories" ON public.recipe_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipe categories" ON public.recipe_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipe categories" ON public.recipe_categories FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_recipe_categories_updated_at
  BEFORE UPDATE ON public.recipe_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_safety_margin NUMERIC DEFAULT 15,
  include_gas_cost BOOLEAN DEFAULT false,
  gas_cost_per_hour NUMERIC DEFAULT 0,
  include_energy_cost BOOLEAN DEFAULT false,
  energy_cost_per_hour NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.recipe_categories(id) ON DELETE RESTRICT,
  yield_quantity NUMERIC NOT NULL,
  yield_unit TEXT NOT NULL DEFAULT 'unidades',
  prep_time_minutes INTEGER NOT NULL,
  oven_time_minutes INTEGER,
  instructions TEXT,
  safety_margin_percent NUMERIC,
  additional_costs NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL,
  unit public.measurement_unit NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for recipe_ingredients
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe ingredients of their recipes" ON public.recipe_ingredients FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()));
CREATE POLICY "Users can create recipe ingredients for their recipes" ON public.recipe_ingredients FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()));
CREATE POLICY "Users can update recipe ingredients of their recipes" ON public.recipe_ingredients FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()));
CREATE POLICY "Users can delete recipe ingredients from their recipes" ON public.recipe_ingredients FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()));

-- Create function for default recipe categories
CREATE OR REPLACE FUNCTION public.create_default_recipe_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.recipe_categories (user_id, name, color) VALUES
    (NEW.user_id, 'Bolos', '#f59e0b'),
    (NEW.user_id, 'Tortas', '#ec4899'),
    (NEW.user_id, 'Doces', '#3b82f6'),
    (NEW.user_id, 'Salgados', '#22c55e'),
    (NEW.user_id, 'Pães', '#78350f'),
    (NEW.user_id, 'Biscoitos', '#a855f7'),
    (NEW.user_id, 'Sobremesas', '#ef4444'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for default user settings
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for new users (attach to profiles table)
CREATE TRIGGER on_profile_created_recipe_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_recipe_categories();

CREATE TRIGGER on_profile_created_user_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_settings();

-- Make category_id required on ingredients (update existing NULL values first would be needed in production)
-- For new ingredients, category_id will be required through form validation