-- Add unit column to product_recipes for specifying the measurement unit
ALTER TABLE product_recipes 
ADD COLUMN unit text DEFAULT 'un';