
-- =============================================
-- ETAPA 1a: Soft delete - adicionar is_active
-- =============================================
ALTER TABLE ingredients ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE recipes ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE packaging ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE decorations ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE clients ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- =============================================
-- ETAPA 1b: Snapshots em pedidos
-- =============================================
-- Snapshot do nome do produto no item do pedido + custo/lucro
ALTER TABLE order_items ADD COLUMN product_name TEXT;
ALTER TABLE order_items ADD COLUMN cost_at_sale NUMERIC;
ALTER TABLE order_items ADD COLUMN profit_at_sale NUMERIC;

-- Snapshot do nome do cliente no pedido
ALTER TABLE orders ADD COLUMN client_name TEXT;

-- =============================================
-- ETAPA 1c: Backfill de snapshots para dados existentes
-- =============================================
UPDATE order_items oi
SET product_name = p.name
FROM products p
WHERE oi.product_id = p.id AND oi.product_name IS NULL;

UPDATE orders o
SET client_name = c.name
FROM clients c
WHERE o.client_id = c.id AND o.client_name IS NULL;

-- Fallback: se algum product_id já não existir mais, usar placeholder
UPDATE order_items SET product_name = 'Produto removido' WHERE product_name IS NULL;
UPDATE orders SET client_name = 'Cliente removido' WHERE client_name IS NULL;

-- =============================================
-- ETAPA 1d: Tornar snapshots NOT NULL após backfill
-- =============================================
ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE orders ALTER COLUMN client_name SET NOT NULL;

-- =============================================
-- ETAPA 1e: Alterar FKs de CASCADE para SET NULL
-- =============================================
-- Tornar product_id nullable
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- Trocar FK para SET NULL (nome confirmado: order_items_product_id_fkey)
ALTER TABLE order_items
  DROP CONSTRAINT order_items_product_id_fkey,
  ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Tornar client_id nullable
ALTER TABLE orders ALTER COLUMN client_id DROP NOT NULL;

-- Trocar FK para SET NULL (nome confirmado: orders_client_id_fkey)
ALTER TABLE orders
  DROP CONSTRAINT orders_client_id_fkey,
  ADD CONSTRAINT orders_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- =============================================
-- ETAPA 1f: Índices para filtro is_active
-- =============================================
CREATE INDEX idx_ingredients_active ON ingredients(is_active) WHERE is_active = true;
CREATE INDEX idx_recipes_active ON recipes(is_active) WHERE is_active = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_packaging_active ON packaging(is_active) WHERE is_active = true;
CREATE INDEX idx_decorations_active ON decorations(is_active) WHERE is_active = true;
CREATE INDEX idx_clients_active ON clients(is_active) WHERE is_active = true;
