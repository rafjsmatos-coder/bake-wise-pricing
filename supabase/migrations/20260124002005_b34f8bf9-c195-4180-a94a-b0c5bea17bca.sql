-- Add indirect operational cost percent to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS indirect_operational_cost_percent numeric DEFAULT 5;

-- Drop product_materials junction table first (depends on other tables)
DROP TABLE IF EXISTS public.product_materials;

-- Drop production_materials table
DROP TABLE IF EXISTS public.production_materials;

-- Drop production_material_categories table
DROP TABLE IF EXISTS public.production_material_categories;