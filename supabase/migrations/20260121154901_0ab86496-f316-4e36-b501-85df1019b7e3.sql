-- Create decorations table
CREATE TABLE public.decorations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  package_quantity NUMERIC NOT NULL,
  unit measurement_unit NOT NULL,
  category_id UUID REFERENCES public.decoration_categories(id) ON DELETE SET NULL,
  brand TEXT,
  supplier TEXT,
  stock_quantity NUMERIC,
  min_stock_alert NUMERIC,
  cost_per_unit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.decorations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own decorations" 
ON public.decorations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decorations" 
ON public.decorations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decorations" 
ON public.decorations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decorations" 
ON public.decorations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_decorations_updated_at
BEFORE UPDATE ON public.decorations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();