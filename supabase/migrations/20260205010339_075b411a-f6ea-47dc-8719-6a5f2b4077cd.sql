-- Add new columns for flexible oven cost configuration
ALTER TABLE user_settings 
  ADD COLUMN IF NOT EXISTS oven_type text DEFAULT 'gas' CHECK (oven_type IN ('gas', 'electric', 'both')),
  ADD COLUMN IF NOT EXISTS electric_oven_cost_per_hour numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_oven_type text DEFAULT 'gas' CHECK (default_oven_type IN ('gas', 'electric'));

-- Add oven_type to recipes for users who have both types
ALTER TABLE recipes 
  ADD COLUMN IF NOT EXISTS oven_type text DEFAULT NULL CHECK (oven_type IN ('gas', 'electric'));

-- Comment for documentation
COMMENT ON COLUMN user_settings.oven_type IS 'Type of oven: gas, electric, or both';
COMMENT ON COLUMN user_settings.electric_oven_cost_per_hour IS 'Cost per hour for electric oven usage';
COMMENT ON COLUMN user_settings.default_oven_type IS 'Default oven type when user has both';
COMMENT ON COLUMN recipes.oven_type IS 'Oven type for this specific recipe (overrides user default)';