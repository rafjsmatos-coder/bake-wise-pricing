-- Add labor cost fields to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS include_labor_cost boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS labor_cost_per_hour numeric DEFAULT 0;