import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIngredients, type Ingredient } from '@/hooks/useIngredients';
import { UNITS, type MeasurementUnit, formatCurrency, getFractionalUnit } from '@/lib/unit-conversion';
import { getCompatibleUnits, calculateIngredientCost } from '@/lib/recipe-cost-calculator';
import { Plus, X, Check, ChevronsUpDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RecipeIngredientItem {
  ingredient_id: string;
  ingredient?: Ingredient;
  quantity: number;
  unit: MeasurementUnit;
  cost: number;
}

interface IngredientSelectorProps {
  selectedIngredients: RecipeIngredientItem[];
  onIngredientsChange: (ingredients: RecipeIngredientItem[]) => void;
  linkedIds?: string[];
}

export function IngredientSelector({
  selectedIngredients,
  onIngredientsChange,
  linkedIds,
}: IngredientSelectorProps) {
  const hasLinked = linkedIds && linkedIds.length > 0;
  const { ingredients } = useIngredients(hasLinked ? { includeInactive: true } : undefined);
  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<MeasurementUnit>('g');

  const availableIngredients = useMemo(() => {
    const selectedIds = new Set(selectedIngredients.map(si => si.ingredient_id));
    return ingredients.filter(ing => !selectedIds.has(ing.id) && ing.is_active !== false);
  }, [ingredients, selectedIngredients]);

  const compatibleUnits = useMemo(() => {
    if (!selectedIngredient) return Object.keys(UNITS) as MeasurementUnit[];
    return getCompatibleUnits(selectedIngredient.unit);
  }, [selectedIngredient]);

  const previewCost = useMemo(() => {
    if (!selectedIngredient || !quantity || Number(quantity) <= 0) return null;

    const cost = calculateIngredientCost(
      Number(quantity),
      unit,
      Number(selectedIngredient.purchase_price),
      Number(selectedIngredient.package_quantity),
      selectedIngredient.unit
    );

    return cost;
  }, [selectedIngredient, quantity, unit]);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setUnit(getFractionalUnit(ingredient.unit));
    setOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity || Number(quantity) <= 0) return;

    const cost = calculateIngredientCost(
      Number(quantity),
      unit,
      Number(selectedIngredient.purchase_price),
      Number(selectedIngredient.package_quantity),
      selectedIngredient.unit
    );

    const newIngredient: RecipeIngredientItem = {
      ingredient_id: selectedIngredient.id,
      ingredient: selectedIngredient,
      quantity: Number(quantity),
      unit,
      cost,
    };

    onIngredientsChange([...selectedIngredients, newIngredient]);
    setSelectedIngredient(null);
    setQuantity('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    onIngredientsChange(selectedIngredients.filter(si => si.ingredient_id !== ingredientId));
  };

  const handleUpdateQuantity = (ingredientId: string, newQuantity: number) => {
    onIngredientsChange(
      selectedIngredients.map(si => {
        if (si.ingredient_id !== ingredientId) return si;

        const ingredient = si.ingredient || ingredients.find(i => i.id === ingredientId);
        if (!ingredient) return si;

        const cost = calculateIngredientCost(
          newQuantity,
          si.unit,
          Number(ingredient.purchase_price),
          Number(ingredient.package_quantity),
          ingredient.unit
        );

        return { ...si, quantity: newQuantity, cost };
      })
    );
  };

  const handleUpdateUnit = (ingredientId: string, newUnit: MeasurementUnit) => {
    onIngredientsChange(
      selectedIngredients.map(si => {
        if (si.ingredient_id !== ingredientId) return si;

        const ingredient = si.ingredient || ingredients.find(i => i.id === ingredientId);
        if (!ingredient) return si;

        const cost = calculateIngredientCost(
          si.quantity,
          newUnit,
          Number(ingredient.purchase_price),
          Number(ingredient.package_quantity),
          ingredient.unit
        );

        return { ...si, unit: newUnit, cost };
      })
    );
  };

  const totalCost = selectedIngredients.reduce((sum, si) => sum + si.cost, 0);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Ingredientes *</Label>

      {/* Add Ingredient Section */}
      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ingredient Selector */}
          <div className="sm:col-span-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between min-h-[44px]"
                >
                  {selectedIngredient ? (
                    <span className="truncate">{selectedIngredient.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Selecionar ingrediente...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[300px] max-w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar ingrediente..." />
                  <CommandList>
                    <CommandEmpty>Nenhum ingrediente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableIngredients.map((ingredient) => (
                        <CommandItem
                          key={ingredient.id}
                          value={ingredient.name}
                          onSelect={() => handleSelectIngredient(ingredient)}
                          className="group"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedIngredient?.id === ingredient.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="group-aria-selected:text-accent-foreground">{ingredient.name}</span>
                            <span className="text-xs text-muted-foreground group-aria-selected:text-accent-foreground">
                              {formatCurrency(Number(ingredient.cost_per_unit))}/{UNITS[ingredient.unit].baseUnit}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity */}
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              min="0"
              placeholder="Qtd"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedIngredient}
              className="flex-1 min-h-[44px]"
            />
            <Select
              value={unit}
              onValueChange={(value: MeasurementUnit) => setUnit(value)}
              disabled={!selectedIngredient}
            >
              <SelectTrigger className="w-20 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {compatibleUnits.map((u) => (
                  <SelectItem key={u} value={u} className="py-3">
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button
            type="button"
            onClick={handleAddIngredient}
            disabled={!selectedIngredient || !quantity || Number(quantity) <= 0}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {previewCost !== null && (
          <div className="text-sm text-muted-foreground">
            Custo estimado: <span className="font-medium text-foreground">{formatCurrency(previewCost)}</span>
          </div>
        )}
      </div>

      {/* Selected Ingredients List */}
      {selectedIngredients.length > 0 ? (
        <div className="space-y-2">
          {selectedIngredients.map((item) => {
            const ingredient = item.ingredient || ingredients.find(i => i.id === item.ingredient_id);
            const itemCompatibleUnits = ingredient ? getCompatibleUnits(ingredient.unit) : [item.unit];

            return (
              <div
                key={item.ingredient_id}
                className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">
                      {ingredient?.name || 'Ingrediente'}
                    </span>
                    {ingredient?.is_active === false && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Inativo)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.ingredient_id, Number(e.target.value))}
                    className="w-16 sm:w-20 min-h-[44px]"
                  />
                  <Select
                    value={item.unit}
                    onValueChange={(value: MeasurementUnit) => handleUpdateUnit(item.ingredient_id, value)}
                  >
                    <SelectTrigger className="w-16 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {itemCompatibleUnits.map((u) => (
                        <SelectItem key={u} value={u} className="py-3">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-right min-w-[70px] sm:min-w-[80px]">
                    <span className="font-medium text-accent text-sm sm:text-base">
                      {formatCurrency(item.cost)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(item.ingredient_id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <span className="font-medium">Total dos ingredientes:</span>
            <span className="text-lg font-bold text-accent">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum ingrediente adicionado</p>
          <p className="text-sm">Selecione ingredientes acima para adicionar à receita</p>
        </div>
      )}
    </div>
  );
}
