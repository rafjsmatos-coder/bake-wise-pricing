import { useState } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { calculateProductCost, formatCurrency } from '@/lib/product-cost-calculator';
import { calculateRecipeCost } from '@/lib/recipe-cost-calculator';
import { OrderItemFormData } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { Plus, Trash2 } from 'lucide-react';

interface OrderProductSelectorProps {
  items: OrderItemFormData[];
  onChange: (items: OrderItemFormData[]) => void;
}

export function OrderProductSelector({ items, onChange }: OrderProductSelectorProps) {
  const { products } = useProducts();
  const { settings } = useUserSettings();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPriceStr, setUnitPriceStr] = useState('');

  const getSuggestedPrice = (product: Product): number => {
    if (!product || !settings) return 0;

    const ingredientsData = ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      purchase_price: Number(i.purchase_price),
      package_quantity: Number(i.package_quantity),
      unit: i.unit,
      cost_per_unit: Number(i.cost_per_unit),
    }));

    const timeSettings = {
      ovenType: settings.oven_type,
      includeGasCost: settings.include_gas_cost,
      gasCostPerHour: Number(settings.gas_cost_per_hour) || 0,
      electricOvenCostPerHour: Number(settings.electric_oven_cost_per_hour) || 0,
      defaultOvenType: settings.default_oven_type,
      includeEnergyCost: settings.include_energy_cost,
      energyCostPerHour: Number(settings.energy_cost_per_hour) || 0,
      includeLaborCost: settings.include_labor_cost,
      laborCostPerHour: Number(settings.labor_cost_per_hour) || 0,
    };

    const recipeCosts: Record<string, number> = {};
    if (product.product_recipes) {
      for (const pr of product.product_recipes) {
        const recipe = recipes.find((r) => r.id === pr.recipe_id);
        if (recipe) {
          const recipeIngredients = (recipe as any).recipe_ingredients || [];
          const recipeCost = calculateRecipeCost(
            recipeIngredients,
            ingredientsData,
            recipe.yield_quantity,
            recipe.yield_unit as any,
            Number(recipe.safety_margin_percent) || Number(settings.default_safety_margin) || 15,
            Number(recipe.additional_costs) || 0,
            Number(recipe.prep_time_minutes) || 0,
            Number(recipe.oven_time_minutes) || 0,
            timeSettings as any,
            recipe.oven_type as any
          );
          recipeCosts[pr.recipe_id] = recipeCost.totalCost;
        }
      }
    }

    const laborCostPerHour = settings.include_labor_cost
      ? Number(settings.labor_cost_per_hour) || 0
      : 0;

    const breakdown = calculateProductCost({
      product,
      recipeCosts,
      laborCostPerHour,
      indirectOperationalCostPercent: Number(settings.indirect_operational_cost_percent) || 5,
    });

    return breakdown.suggestedSellingPrice;
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      const suggested = getSuggestedPrice(product);
      setUnitPriceStr(String(Math.round(suggested * 100) / 100).replace('.', ','));
    }
  };

  const handleAdd = () => {
    const parsedPrice = parseFloat(unitPriceStr.replace(',', '.')) || 0;
    if (!selectedProductId || quantity <= 0) return;

    const newItem: OrderItemFormData = {
      product_id: selectedProductId,
      quantity,
      unit_price: parsedPrice,
      total_price: Math.round(quantity * parsedPrice * 100) / 100,
    };

    onChange([...items, newItem]);
    setSelectedProductId('');
    setQuantity(1);
    setUnitPriceStr('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const productItems = products.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const getProductName = (productId: string) =>
    products.find((p) => p.id === productId)?.name || 'Produto';

  return (
    <div className="space-y-4">
      <Label>Produtos do Pedido</Label>

      {/* Add product */}
      <div className="space-y-3 p-3 border border-border rounded-lg">
        <SearchableCombobox
          items={productItems}
          onSelect={handleProductSelect}
          placeholder="Selecionar produto..."
          searchPlaceholder="Buscar produto..."
          emptyMessage="Nenhum produto encontrado"
          title="Selecionar Produto"
        />

        {selectedProductId && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Qtd</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="text-base"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Preço un. (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={unitPriceStr}
                onChange={(e) => setUnitPriceStr(e.target.value)}
                placeholder="0,00"
                className="text-base"
              />
            </div>
            <div className="flex items-end col-span-2 sm:col-span-1">
              <Button onClick={handleAdd} className="w-full gap-2" size="default">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getProductName(item.product_id)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-primary">
              {formatCurrency(items.reduce((sum, item) => sum + item.total_price, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
