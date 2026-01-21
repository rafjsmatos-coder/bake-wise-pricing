-- Create decoration_categories table
CREATE TABLE public.decoration_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.decoration_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own decoration categories" 
ON public.decoration_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decoration categories" 
ON public.decoration_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decoration categories" 
ON public.decoration_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decoration categories" 
ON public.decoration_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_decoration_categories_updated_at
BEFORE UPDATE ON public.decoration_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create default decoration categories
CREATE OR REPLACE FUNCTION public.create_default_decoration_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.decoration_categories (user_id, name, color) VALUES
    (NEW.user_id, 'Fitas e Laços', '#f59e0b'),
    (NEW.user_id, 'Flores e Folhagens', '#ec4899'),
    (NEW.user_id, 'Toppers', '#3b82f6'),
    (NEW.user_id, 'Confeitos e Granulados', '#22c55e'),
    (NEW.user_id, 'Papéis Comestíveis', '#a855f7'),
    (NEW.user_id, 'Corantes', '#ef4444'),
    (NEW.user_id, 'Outros', '#6b7280');
  RETURN NEW;
END;
$function$;

-- Create trigger to create default decoration categories when a new profile is created
CREATE TRIGGER on_profile_created_create_decoration_categories
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_decoration_categories();