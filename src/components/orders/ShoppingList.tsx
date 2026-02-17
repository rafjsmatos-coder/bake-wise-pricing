import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { convertUnit, type MeasurementUnit } from '@/lib/unit-conversion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ShoppingCart, Package, Sparkles, Box, MessageCircle } from 'lucide-react';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShoppingItem {
  id: string;
  name: string;
  type: 'ingredient' | 'decoration' | 'packaging';
  needed: number;
  unit: string;
  currentStock: number;
  toBuy: number;
}

export function ShoppingList() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'this_week' | 'next_week'>('this_week');
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const weekStart = period === 'this_week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const periodOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.delivery_date || !['pending', 'in_production'].includes(o.status)) return false;
      const d = new Date(o.delivery_date);
      return d >= weekStart && d <= weekEnd;
    });
  }, [orders, weekStart, weekEnd]);

  const productIds = useMemo(() => {
    const ids: { productId: string; quantity: number }[] = [];
    periodOrders.forEach((o) => {
      o.order_items?.forEach((item) => {
        ids.push({ productId: item.product_id, quantity: item.quantity });
      });
    });
    return ids;
  }, [periodOrders]);

  const { data: shoppingItems = [], isLoading } = useQuery({
    queryKey: ['shopping-list', period, productIds.map((p) => `${p.productId}-${p.quantity}`).join(',')],
    queryFn: async () => {
      if (productIds.length === 0) return [];

      const allItems: ShoppingItem[] = [];

      for (const { productId, quantity } of productIds) {
        // Direct ingredients
        const { data: prodIngredients } = await supabase
          .from('product_ingredients')
          .select('ingredient_id, quantity, unit, ingredient:ingredients(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodIngredients?.forEach((pi: any) => {
          if (pi.ingredient) {
            const stockRaw = pi.ingredient.stock_quantity || 0;
            const stockConverted = pi.ingredient.unit !== pi.unit
              ? (convertUnit(stockRaw, pi.ingredient.unit as MeasurementUnit, pi.unit as MeasurementUnit) ?? stockRaw)
              : stockRaw;
            const needed = pi.quantity * quantity;
            allItems.push({
              id: pi.ingredient.id,
              name: pi.ingredient.name,
              type: 'ingredient',
              needed,
              unit: pi.unit,
              currentStock: stockConverted,
              toBuy: Math.max(0, needed - stockConverted),
            });
          }
        });

        // Recipes
        const { data: prodRecipes } = await supabase
          .from('product_recipes')
          .select('recipe_id, quantity, recipe:recipes(id, yield_quantity)')
          .eq('product_id', productId);

        for (const pr of prodRecipes || []) {
          const recipe = (pr as any).recipe;
          if (!recipe) continue;
          const mult = ((pr as any).quantity * quantity) / (recipe.yield_quantity || 1);

          const { data: recipeIngredients } = await supabase
            .from('recipe_ingredients')
            .select('ingredient_id, quantity, unit, ingredient:ingredients(id, name, stock_quantity, unit)')
            .eq('recipe_id', pr.recipe_id);

          recipeIngredients?.forEach((ri: any) => {
            if (ri.ingredient) {
              const stockRaw = ri.ingredient.stock_quantity || 0;
              const stockConverted = ri.ingredient.unit !== ri.unit
                ? (convertUnit(stockRaw, ri.ingredient.unit as MeasurementUnit, ri.unit as MeasurementUnit) ?? stockRaw)
                : stockRaw;
              const needed = ri.quantity * mult;
              allItems.push({
                id: ri.ingredient.id,
                name: ri.ingredient.name,
                type: 'ingredient',
                needed,
                unit: ri.unit,
                currentStock: stockConverted,
                toBuy: Math.max(0, needed - stockConverted),
              });
            }
          });
        }

        // Decorations
        const { data: prodDecorations } = await supabase
          .from('product_decorations')
          .select('decoration_id, quantity, unit, decoration:decorations(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodDecorations?.forEach((pd: any) => {
          if (pd.decoration) {
            const stockRaw = pd.decoration.stock_quantity || 0;
            const stockConverted = pd.decoration.unit !== pd.unit
              ? (convertUnit(stockRaw, pd.decoration.unit as MeasurementUnit, pd.unit as MeasurementUnit) ?? stockRaw)
              : stockRaw;
            const needed = pd.quantity * quantity;
            allItems.push({
              id: pd.decoration.id,
              name: pd.decoration.name,
              type: 'decoration',
              needed,
              unit: pd.unit,
              currentStock: stockConverted,
              toBuy: Math.max(0, needed - stockConverted),
            });
          }
        });

        // Packaging
        const { data: prodPackaging } = await supabase
          .from('product_packaging')
          .select('packaging_id, quantity, packaging:packaging(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodPackaging?.forEach((pp: any) => {
          if (pp.packaging) {
            const stockRaw = pp.packaging.stock_quantity || 0;
            const needed = pp.quantity * quantity;
            allItems.push({
              id: pp.packaging.id,
              name: pp.packaging.name,
              type: 'packaging',
              needed,
              unit: pp.packaging.unit,
              currentStock: stockRaw,
              toBuy: Math.max(0, needed - stockRaw),
            });
          }
        });
      }

      // Aggregate
      const aggregated = new Map<string, ShoppingItem>();
      for (const item of allItems) {
        const key = `${item.type}-${item.id}`;
        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.needed += item.needed;
          existing.toBuy = Math.max(0, existing.needed - existing.currentStock);
        } else {
          aggregated.set(key, { ...item });
        }
      }

      return Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!user?.id,
  });

  const displayItems = showAll ? shoppingItems : shoppingItems.filter((i) => i.toBuy > 0);

  const formatQty = (qty: number) => (qty % 1 === 0 ? String(qty) : qty.toFixed(2).replace('.', ','));

  const handleShareWhatsApp = () => {
    const itemsToBuy = shoppingItems.filter((i) => i.toBuy > 0);
    if (itemsToBuy.length === 0) return;

    const periodLabel = period === 'this_week' ? 'esta semana' : 'próxima semana';
    let msg = `🛒 *Lista de Compras - ${periodLabel}*\n\n`;

    const grouped: Record<string, ShoppingItem[]> = {};
    itemsToBuy.forEach((i) => {
      if (!grouped[i.type]) grouped[i.type] = [];
      grouped[i.type].push(i);
    });

    const labels: Record<string, string> = { ingredient: '📦 Ingredientes', decoration: '✨ Decorações', packaging: '📦 Embalagens' };
    for (const [type, items] of Object.entries(grouped)) {
      msg += `${labels[type] || type}\n`;
      items.forEach((i) => {
        msg += `  • ${i.name}: ${formatQty(i.toBuy)} ${i.unit}\n`;
      });
      msg += '\n';
    }

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const typeIcon = (type: string) => {
    if (type === 'ingredient') return <Package className="h-4 w-4 text-muted-foreground" />;
    if (type === 'decoration') return <Sparkles className="h-4 w-4 text-muted-foreground" />;
    return <Box className="h-4 w-4 text-muted-foreground" />;
  };

  const typeLabel = (type: string) => {
    if (type === 'ingredient') return 'Ingredientes';
    if (type === 'decoration') return 'Decorações';
    return 'Embalagens';
  };

  const groupedDisplay = displayItems.reduce((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lista de Compras</h1>
          <p className="text-muted-foreground">
            {format(weekStart, "dd/MM", { locale: ptBR })} a {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
            {' • '}{periodOrders.length} pedido{periodOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" className="gap-2 text-green-600 border-green-600 hover:bg-green-50" onClick={handleShareWhatsApp}>
          <MessageCircle className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>

      {/* Period tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList>
          <TabsTrigger value="this_week">Esta semana</TabsTrigger>
          <TabsTrigger value="next_week">Próxima semana</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Show all toggle */}
      <div className="flex items-center gap-2">
        <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
        <Label htmlFor="show-all" className="text-sm">Mostrar todos (incluindo em estoque)</Label>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {shoppingItems.length === 0 ? 'Nenhum pedido no período' : 'Estoque suficiente!'}
          </h3>
          <p className="text-muted-foreground">
            {shoppingItems.length === 0
              ? 'Não há pedidos pendentes para o período selecionado.'
              : 'Todos os materiais necessários estão em estoque.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(['ingredient', 'decoration', 'packaging'] as const).map((type) => {
            const items = groupedDisplay[type];
            if (!items || items.length === 0) return null;
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {typeIcon(type)}
                  <span>{typeLabel(type)}</span>
                  <span className="text-muted-foreground font-normal">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Necessário: {formatQty(item.needed)} {item.unit} • Estoque: {formatQty(item.currentStock)} {item.unit}
                        </p>
                      </div>
                      {item.toBuy > 0 ? (
                        <span className="text-sm font-bold text-destructive whitespace-nowrap ml-2">
                          Comprar {formatQty(item.toBuy)} {item.unit}
                        </span>
                      ) : (
                        <span className="text-sm text-green-600 whitespace-nowrap ml-2">✓ OK</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
