import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'ingredient' | 'recipe' | 'product' | 'packaging' | 'decoration' | 'client';

export interface DependencyInfo {
  table: string;
  label: string;
  count: number;
}

async function checkTable(table: string, column: string, id: string, label: string): Promise<DependencyInfo | null> {
  const { count, error } = await (supabase
    .from(table as any)
    .select('*', { count: 'exact', head: true }) as any)
    .eq(column, id);
  if (!error && count && count > 0) {
    return { table, label, count };
  }
  return null;
}

export async function checkDependencies(entityType: EntityType, id: string): Promise<DependencyInfo[]> {
  let checks: Promise<DependencyInfo | null>[] = [];

  switch (entityType) {
    case 'ingredient':
      checks = [
        checkTable('recipe_ingredients', 'ingredient_id', id, 'receitas'),
        checkTable('product_ingredients', 'ingredient_id', id, 'produtos'),
      ];
      break;
    case 'recipe':
      checks = [checkTable('product_recipes', 'recipe_id', id, 'produtos')];
      break;
    case 'product':
      checks = [checkTable('order_items', 'product_id', id, 'pedidos')];
      break;
    case 'packaging':
      checks = [checkTable('product_packaging', 'packaging_id', id, 'produtos')];
      break;
    case 'decoration':
      checks = [checkTable('product_decorations', 'decoration_id', id, 'produtos')];
      break;
    case 'client':
      checks = [checkTable('orders', 'client_id', id, 'pedidos')];
      break;
  }

  const results = await Promise.all(checks);
  return results.filter((r): r is DependencyInfo => r !== null);
}
