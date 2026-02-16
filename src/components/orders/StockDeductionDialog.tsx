import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/hooks/useOrders';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Sparkles, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { convertUnit, type MeasurementUnit } from '@/lib/unit-conversion';
import { useQueryClient } from '@tanstack/react-query';

interface MaterialItem {
  id: string;
  name: string;
  type: 'ingredient' | 'decoration' | 'packaging';
  quantity: number;
  unit: string;
  stockUnit: string;
  currentStock: number | null;
  checked: boolean;
}

interface StockDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onComplete: () => void;
}

export function StockDeductionDialog({ open, onOpenChange, order, onComplete }: StockDeductionDialogProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && order) {
      loadMaterials();
    }
  }, [open, order]);

  const loadMaterials = async () => {
    if (!order?.order_items) return;
    setLoading(true);

    try {
      const allMaterials: MaterialItem[] = [];
      
      for (const orderItem of order.order_items) {
        const productId = orderItem.product_id;
        const qty = orderItem.quantity;

        // Get product's direct ingredients
        const { data: prodIngredients } = await supabase
          .from('product_ingredients')
          .select('ingredient_id, quantity, unit, ingredient:ingredients(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodIngredients?.forEach((pi: any) => {
          if (pi.ingredient) {
            allMaterials.push({
              id: pi.ingredient.id,
              name: pi.ingredient.name,
              type: 'ingredient',
              quantity: pi.quantity * qty,
              unit: pi.unit,
              stockUnit: pi.ingredient.unit,
              currentStock: pi.ingredient.stock_quantity,
              checked: true,
            });
          }
        });

        // Get product's recipes and their ingredients
        const { data: prodRecipes } = await supabase
          .from('product_recipes')
          .select('recipe_id, quantity, recipe:recipes(id, yield_quantity)')
          .eq('product_id', productId);

        for (const pr of prodRecipes || []) {
          const recipe = (pr as any).recipe;
          if (!recipe) continue;
          const recipeMultiplier = ((pr as any).quantity * qty) / (recipe.yield_quantity || 1);

          const { data: recipeIngredients } = await supabase
            .from('recipe_ingredients')
            .select('ingredient_id, quantity, unit, ingredient:ingredients(id, name, stock_quantity, unit)')
            .eq('recipe_id', pr.recipe_id);

          recipeIngredients?.forEach((ri: any) => {
            if (ri.ingredient) {
              allMaterials.push({
                id: ri.ingredient.id,
                name: ri.ingredient.name,
                type: 'ingredient',
                quantity: ri.quantity * recipeMultiplier,
                unit: ri.unit,
                stockUnit: ri.ingredient.unit,
                currentStock: ri.ingredient.stock_quantity,
                checked: true,
              });
            }
          });
        }

        // Get product's decorations
        const { data: prodDecorations } = await supabase
          .from('product_decorations')
          .select('decoration_id, quantity, unit, decoration:decorations(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodDecorations?.forEach((pd: any) => {
          if (pd.decoration) {
            allMaterials.push({
              id: pd.decoration.id,
              name: pd.decoration.name,
              type: 'decoration',
              quantity: pd.quantity * qty,
              unit: pd.unit,
              stockUnit: pd.decoration.unit,
              currentStock: pd.decoration.stock_quantity,
              checked: true,
            });
          }
        });

        // Get product's packaging
        const { data: prodPackaging } = await supabase
          .from('product_packaging')
          .select('packaging_id, quantity, packaging:packaging(id, name, stock_quantity, unit)')
          .eq('product_id', productId);

        prodPackaging?.forEach((pp: any) => {
          if (pp.packaging) {
            allMaterials.push({
              id: pp.packaging.id,
              name: pp.packaging.name,
              type: 'packaging',
              quantity: pp.quantity * qty,
              unit: pp.packaging.unit,
              stockUnit: pp.packaging.unit,
              currentStock: pp.packaging.stock_quantity,
              checked: true,
            });
          }
        });
      }

      // Aggregate by id+type
      const aggregated = new Map<string, MaterialItem>();
      for (const m of allMaterials) {
        const key = `${m.type}-${m.id}`;
        if (aggregated.has(key)) {
          aggregated.get(key)!.quantity += m.quantity;
        } else {
          aggregated.set(key, { ...m });
        }
      }

      const result = Array.from(aggregated.values());

      // Auto-skip if no materials have stock defined
      const hasAnyStock = result.some(m => m.currentStock !== null);
      if (!hasAnyStock) {
        onOpenChange(false);
        return;
      }

      setMaterials(result);
    } catch (err) {
      console.error('Error loading materials:', err);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setMaterials((prev) =>
      prev.map((m, i) => (i === index ? { ...m, checked: !m.checked } : m))
    );
  };

  const getConvertedQty = (m: MaterialItem): number | null => {
    if (m.unit === m.stockUnit) return m.quantity;
    return convertUnit(m.quantity, m.unit as MeasurementUnit, m.stockUnit as MeasurementUnit);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const checked = materials.filter((m) => m.checked && m.currentStock !== null);

      for (const m of checked) {
        const convertedQty = getConvertedQty(m);
        if (convertedQty === null) {
          console.warn(`Cannot convert ${m.unit} to ${m.stockUnit} for ${m.name}, skipping`);
          continue;
        }
        const newStock = Math.max(0, (m.currentStock || 0) - convertedQty);
        const table = m.type === 'ingredient' ? 'ingredients' : m.type === 'decoration' ? 'decorations' : 'packaging';
        await supabase.from(table).update({ stock_quantity: newStock }).eq('id', m.id);
      }

      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['decorations'] });
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Estoque atualizado com sucesso!');
      onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error('Error deducting stock:', err);
      toast.error('Erro ao atualizar estoque');
    } finally {
      setSubmitting(false);
    }
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

  const groupedMaterials = materials.reduce((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, MaterialItem[]>);

  const formatQty = (qty: number) => {
    return qty % 1 === 0 ? String(qty) : qty.toFixed(2).replace('.', ',');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[100dvh] overflow-y-auto overflow-x-hidden sm:max-h-[85vh]" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
        <DialogHeader>
          <DialogTitle>Baixa de Estoque</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : materials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum material vinculado aos produtos deste pedido.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione os materiais para descontar do estoque:
            </p>
            {(['ingredient', 'decoration', 'packaging'] as const).map((type) => {
              const items = groupedMaterials[type];
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {typeIcon(type)}
                    <span>{typeLabel(type)}</span>
                  </div>
                  {items.map((m, idx) => {
                    const globalIdx = materials.indexOf(m);
                    const converted = getConvertedQty(m);
                    const displayQty = converted !== null ? converted : m.quantity;
                    const displayUnit = converted !== null ? m.stockUnit : m.unit;
                    return (
                      <label
                        key={`${m.id}-${idx}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={m.checked}
                          onCheckedChange={() => toggleItem(globalIdx)}
                          disabled={m.currentStock === null}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Descontar: {formatQty(displayQty)} {displayUnit}
                            {m.currentStock !== null && ` • Estoque: ${formatQty(m.currentStock)} ${m.stockUnit}`}
                            {m.currentStock === null && ' • Sem estoque cadastrado'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Pular
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || materials.filter((m) => m.checked && m.currentStock !== null).length === 0}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmar Baixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
