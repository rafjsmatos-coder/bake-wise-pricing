-- Create enum for measurement units
CREATE TYPE public.measurement_unit AS ENUM ('kg', 'g', 'L', 'ml', 'un');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories RLS policies
CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  package_quantity DECIMAL(10,3) NOT NULL,
  unit measurement_unit NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  supplier TEXT,
  expiry_date DATE,
  stock_quantity DECIMAL(10,3),
  min_stock_alert DECIMAL(10,3),
  cost_per_unit DECIMAL(10,6) GENERATED ALWAYS AS (purchase_price / package_quantity) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ingredients
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Ingredients RLS policies
CREATE POLICY "Users can view their own ingredients"
  ON public.ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ingredients"
  ON public.ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients"
  ON public.ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients"
  ON public.ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- Create price history table
CREATE TABLE public.ingredient_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  package_quantity DECIMAL(10,3) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on price history
ALTER TABLE public.ingredient_price_history ENABLE ROW LEVEL SECURITY;

-- Price history RLS policies (through ingredient ownership)
CREATE POLICY "Users can view price history of their ingredients"
  ON public.ingredient_price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ingredients
      WHERE ingredients.id = ingredient_price_history.ingredient_id
      AND ingredients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert price history for their ingredients"
  ON public.ingredient_price_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ingredients
      WHERE ingredients.id = ingredient_price_history.ingredient_id
      AND ingredients.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to record price history on ingredient update
CREATE OR REPLACE FUNCTION public.record_price_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.purchase_price IS DISTINCT FROM NEW.purchase_price OR OLD.package_quantity IS DISTINCT FROM NEW.package_quantity THEN
    INSERT INTO public.ingredient_price_history (ingredient_id, price, package_quantity)
    VALUES (NEW.id, NEW.purchase_price, NEW.package_quantity);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to record price history
CREATE TRIGGER record_ingredient_price_history
  AFTER UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.record_price_history();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories function (called after profile creation)
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color) VALUES
    (NEW.user_id, 'Farinhas', '#f59e0b'),
    (NEW.user_id, 'Açúcares', '#ec4899'),
    (NEW.user_id, 'Laticínios', '#3b82f6'),
    (NEW.user_id, 'Ovos', '#eab308'),
    (NEW.user_id, 'Chocolates', '#78350f'),
    (NEW.user_id, 'Frutas', '#22c55e'),
    (NEW.user_id, 'Essências', '#a855f7'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create default categories for new users
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();