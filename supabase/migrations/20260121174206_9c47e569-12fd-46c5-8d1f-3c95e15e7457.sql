-- Create packaging_categories table
CREATE TABLE public.packaging_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packaging_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own packaging categories" 
ON public.packaging_categories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own packaging categories" 
ON public.packaging_categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packaging categories" 
ON public.packaging_categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packaging categories" 
ON public.packaging_categories FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_packaging_categories_updated_at
BEFORE UPDATE ON public.packaging_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for default packaging categories
CREATE OR REPLACE FUNCTION public.create_default_packaging_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.packaging_categories (user_id, name, color) VALUES
    (NEW.user_id, 'Caixas', '#f59e0b'),
    (NEW.user_id, 'Sacos e Sacolas', '#ec4899'),
    (NEW.user_id, 'Potes e Tampas', '#3b82f6'),
    (NEW.user_id, 'Forminhas', '#22c55e'),
    (NEW.user_id, 'Etiquetas', '#a855f7'),
    (NEW.user_id, 'Fitas para Embalagem', '#ef4444'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create default packaging categories for new users
CREATE TRIGGER on_profile_created_packaging_categories
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_packaging_categories();

-- Create packaging table
CREATE TABLE public.packaging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  package_quantity NUMERIC NOT NULL,
  unit public.measurement_unit NOT NULL,
  category_id UUID REFERENCES public.packaging_categories(id) ON DELETE SET NULL,
  brand TEXT,
  supplier TEXT,
  dimensions TEXT,
  stock_quantity NUMERIC,
  min_stock_alert NUMERIC,
  cost_per_unit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packaging ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own packaging" 
ON public.packaging FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own packaging" 
ON public.packaging FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packaging" 
ON public.packaging FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packaging" 
ON public.packaging FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_packaging_updated_at
BEFORE UPDATE ON public.packaging
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();