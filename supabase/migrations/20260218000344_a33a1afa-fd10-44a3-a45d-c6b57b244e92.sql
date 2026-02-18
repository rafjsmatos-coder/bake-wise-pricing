
-- FAQ Categories table
CREATE TABLE public.faq_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can view FAQ categories"
ON public.faq_categories FOR SELECT
TO authenticated
USING (true);

-- Admins can manage
CREATE POLICY "Admins can insert FAQ categories"
ON public.faq_categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update FAQ categories"
ON public.faq_categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete FAQ categories"
ON public.faq_categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- FAQ Items table
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read published items
CREATE POLICY "Authenticated users can view published FAQ items"
ON public.faq_items FOR SELECT
TO authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert FAQ items"
ON public.faq_items FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update FAQ items"
ON public.faq_items FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete FAQ items"
ON public.faq_items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories
INSERT INTO public.faq_categories (name, icon, display_order) VALUES
  ('Primeiros Passos', '🚀', 1),
  ('Ingredientes e Receitas', '🧁', 2),
  ('Produtos e Precificação', '💰', 3),
  ('Pedidos e Estoque', '📦', 4),
  ('Financeiro', '📊', 5),
  ('Assinatura e Conta', '💳', 6);
