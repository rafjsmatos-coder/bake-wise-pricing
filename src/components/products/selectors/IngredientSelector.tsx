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
import { useIngredients } from '@/hooks/useIngredients';
import { Plus, X, Check, ChevronsUpDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, convertUnit, getCostPerUnit } from '@/lib/unit-conversion';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

const UNITS = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'Quilograma(s)' },
  { value: 'g', label: 'Grama(s)' },
  { value: 'L', label: 'Litro(s)' },
  { value: 'ml', label: 'Mililitro(s)' },
  { value: 'm', label: 'Metro(s)' },
  { value: 'cm', label: 'Centímetro(s)' },
] as const;

export interface SelectedIngredient {
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  name: string;
}

interface IngredientSelectorProps {
  selectedIngredients: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
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
  const [selectedIngredient, setSelectedIngredient] = useState<typeof ingredients[0] | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<MeasurementUnit>('g');

  const availableIngredients = useMemo(() => {
    const selectedIds = new Set(selectedIngredients.map(i => i.ingredient_id));
    return ingredients.filter(i => !selectedIds.has(i.id) && i.is_active !== false);
  }, [ingredients, selectedIngredients]);

  const handleSelectIngredient = (ingredient: typeof ingredients[0]) => {
    setSelectedIngredient(ingredient);
    setUnit(ingredient.unit);
    setOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity || Number(quantity) <= 0) return;

    const newIngredient: SelectedIngredient = {
      ingredient_id: selectedIngredient.id,
      quantity: Number(quantity),
      unit,
      name: selectedIngredient.name,
    };

    onIngredientsChange([...selectedIngredients, newIngredient]);
    setSelectedIngredient(null);
    setQuantity('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    onIngredientsChange(selectedIngredients.filter(i => i.ingredient_id !== ingredientId));
  };

  const handleUpdateQuantity = (ingredientId: string, newQuantity: number) => {
    onIngredientsChange(
      selectedIngredients.map(i => 
        i.ingredient_id === ingredientId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const handleUpdateUnit = (ingredientId: string, newUnit: MeasurementUnit) => {
    onIngredientsChange(
      selectedIngredients.map(i => 
        i.ingredient_id === ingredientId ? { ...i, unit: newUnit } : i
      )
    );
  };

  const getItemCost = (item: SelectedIngredient): number | null => {
    const ing = ingredients.find(i => i.id === item.ingredient_id);
    if (!ing) return null;
    const costPerUnit = Number(ing.purchase_price) / Number(ing.package_quantity);
    const convertedQty = convertUnit(item.quantity, item.unit, ing.unit) ?? item.quantity;
    return convertedQty * costPerUnit;
  };

  const CommandContent = (
    <Command>
      <CommandInput placeholder="Buscar ingrediente..." />
      <CommandList>
        <CommandEmpty>Nenhum ingrediente encontrado.</CommandEmpty>
        <CommandGroup>
          {availableIngredients.map((ingredient) => {
            const costInfo = getCostPerUnit(
              Number(ingredient.purchase_price),
              Number(ingredient.package_quantity),
              ingredient.unit
            );
            return (
              <CommandItem
                key={ingredient.id}
                value={ingredient.name}
                onSelect={() => handleSelectIngredient(ingredient)}
                className="py-3"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedIngredient?.id === ingredient.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col flex-1">
                  <span>{ingredient.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ingredient.categories?.name || 'Sem categoria'} · {costInfo.formatted}
                  </span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Ingredientes Avulsos</Label>

      {/* Add Ingredient Section */}
      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ingredient Selector */}
          <div className="sm:col-span-1">
            {isMobile ? (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between min-h-[44px]"
                  >
                    {selectedIngredient ? (
                      <span className="truncate">{selectedIngredient.name}</span>
                    ) : (
                      <span className="text-muted-foreground">Selecionar ingrediente...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-4">
                  <div className="mt-4">
                    {CommandContent}
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
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
                <PopoverContent className="w-[300px] p-0">
                  {CommandContent}
                </PopoverContent>
              </Popover>
            )}
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
              autoComplete="off"
              className="flex-1 min-h-[44px]"
            />
            <Select
              value={unit}
              onValueChange={(value) => setUnit(value as MeasurementUnit)}
              disabled={!selectedIngredient}
            >
              <SelectTrigger className="w-20 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value} className="py-3">
                    {u.value}
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
      </div>

      {/* Selected Ingredients List */}
      {selectedIngredients.length > 0 ? (
        <div className="space-y-2">
          {selectedIngredients.map((item) => {
            const itemCost = getItemCost(item);
            return (
              <div
                key={item.ingredient_id}
                className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                    {ingredients.find(i => i.id === item.ingredient_id)?.is_active === false && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Inativo)</span>
                    )}
                  </div>
                  {itemCost != null && (
                    <p className="text-xs text-primary font-medium ml-6">
                      {formatCurrency(itemCost)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.ingredient_id, Number(e.target.value))}
                    autoComplete="off"
                    className="w-16 sm:w-20 min-h-[44px]"
                  />
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleUpdateUnit(item.ingredient_id, value as MeasurementUnit)}
                  >
                    <SelectTrigger className="w-16 sm:w-20 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value} className="py-3">
                          {u.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum ingrediente adicionado</p>
          <p className="text-sm">Selecione ingredientes acima para adicionar ao produto</p>
        </div>
      )}
    </div>
  );
}