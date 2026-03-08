
CREATE OR REPLACE FUNCTION public.update_product_with_relations(
  p_product_id UUID,
  p_name TEXT,
  p_category_id UUID DEFAULT NULL,
  p_decoration_time_minutes INTEGER DEFAULT 0,
  p_profit_margin_percent NUMERIC DEFAULT 30,
  p_additional_costs NUMERIC DEFAULT 0,
  p_notes TEXT DEFAULT NULL,
  p_recipes JSONB DEFAULT '[]'::jsonb,
  p_ingredients JSONB DEFAULT '[]'::jsonb,
  p_decorations JSONB DEFAULT '[]'::jsonb,
  p_packaging JSONB DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_recipe JSONB;
  v_ingredient JSONB;
  v_decoration JSONB;
  v_pkg JSONB;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Product not found or access denied';
  END IF;

  -- Validate product name
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Product name is required';
  END IF;

  -- Validate recipes array
  FOR v_recipe IN SELECT * FROM jsonb_array_elements(p_recipes)
  LOOP
    IF (v_recipe->>'recipe_id') IS NULL OR (v_recipe->>'recipe_id') = '' THEN
      RAISE EXCEPTION 'Recipe ID is required for all recipes';
    END IF;
    IF (v_recipe->>'quantity')::numeric <= 0 THEN
      RAISE EXCEPTION 'Recipe quantity must be greater than 0';
    END IF;
  END LOOP;

  -- Validate ingredients array
  FOR v_ingredient IN SELECT * FROM jsonb_array_elements(p_ingredients)
  LOOP
    IF (v_ingredient->>'ingredient_id') IS NULL OR (v_ingredient->>'ingredient_id') = '' THEN
      RAISE EXCEPTION 'Ingredient ID is required for all ingredients';
    END IF;
    IF (v_ingredient->>'quantity')::numeric <= 0 THEN
      RAISE EXCEPTION 'Ingredient quantity must be greater than 0';
    END IF;
    IF (v_ingredient->>'unit') IS NULL OR (v_ingredient->>'unit') = '' THEN
      RAISE EXCEPTION 'Ingredient unit is required';
    END IF;
  END LOOP;

  -- Validate decorations array
  FOR v_decoration IN SELECT * FROM jsonb_array_elements(p_decorations)
  LOOP
    IF (v_decoration->>'decoration_id') IS NULL OR (v_decoration->>'decoration_id') = '' THEN
      RAISE EXCEPTION 'Decoration ID is required for all decorations';
    END IF;
    IF (v_decoration->>'quantity')::numeric <= 0 THEN
      RAISE EXCEPTION 'Decoration quantity must be greater than 0';
    END IF;
    IF (v_decoration->>'unit') IS NULL OR (v_decoration->>'unit') = '' THEN
      RAISE EXCEPTION 'Decoration unit is required';
    END IF;
  END LOOP;

  -- Validate packaging array
  FOR v_pkg IN SELECT * FROM jsonb_array_elements(p_packaging)
  LOOP
    IF (v_pkg->>'packaging_id') IS NULL OR (v_pkg->>'packaging_id') = '' THEN
      RAISE EXCEPTION 'Packaging ID is required for all packaging';
    END IF;
    IF (v_pkg->>'quantity')::numeric <= 0 THEN
      RAISE EXCEPTION 'Packaging quantity must be greater than 0';
    END IF;
  END LOOP;

  -- Update product
  UPDATE products SET
    name = trim(p_name),
    category_id = p_category_id,
    decoration_time_minutes = p_decoration_time_minutes,
    profit_margin_percent = p_profit_margin_percent,
    additional_costs = p_additional_costs,
    notes = p_notes
  WHERE id = p_product_id AND user_id = v_user_id;

  -- Delete all existing relations
  DELETE FROM product_recipes WHERE product_id = p_product_id;
  DELETE FROM product_ingredients WHERE product_id = p_product_id;
  DELETE FROM product_decorations WHERE product_id = p_product_id;
  DELETE FROM product_packaging WHERE product_id = p_product_id;

  -- Insert new recipes (deduplicated by recipe_id)
  INSERT INTO product_recipes (product_id, recipe_id, quantity, unit)
  SELECT DISTINCT ON ((r->>'recipe_id')::uuid)
    p_product_id,
    (r->>'recipe_id')::uuid,
    (r->>'quantity')::numeric,
    COALESCE(r->>'unit', 'un')
  FROM jsonb_array_elements(p_recipes) AS r
  WHERE jsonb_array_length(p_recipes) > 0;

  -- Insert new ingredients (deduplicated by ingredient_id)
  INSERT INTO product_ingredients (product_id, ingredient_id, quantity, unit)
  SELECT DISTINCT ON ((i->>'ingredient_id')::uuid)
    p_product_id,
    (i->>'ingredient_id')::uuid,
    (i->>'quantity')::numeric,
    (i->>'unit')::measurement_unit
  FROM jsonb_array_elements(p_ingredients) AS i
  WHERE jsonb_array_length(p_ingredients) > 0;

  -- Insert new decorations (deduplicated by decoration_id)
  INSERT INTO product_decorations (product_id, decoration_id, quantity, unit)
  SELECT DISTINCT ON ((d->>'decoration_id')::uuid)
    p_product_id,
    (d->>'decoration_id')::uuid,
    (d->>'quantity')::numeric,
    (d->>'unit')::measurement_unit
  FROM jsonb_array_elements(p_decorations) AS d
  WHERE jsonb_array_length(p_decorations) > 0;

  -- Insert new packaging (deduplicated by packaging_id)
  INSERT INTO product_packaging (product_id, packaging_id, quantity)
  SELECT DISTINCT ON ((pk->>'packaging_id')::uuid)
    p_product_id,
    (pk->>'packaging_id')::uuid,
    (pk->>'quantity')::numeric
  FROM jsonb_array_elements(p_packaging) AS pk
  WHERE jsonb_array_length(p_packaging) > 0;

END;
$$;
