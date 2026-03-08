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
import { useRecipes } from '@/hooks/useRecipes';
import { Plus, X, Check, ChevronsUpDown, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, convertUnit, type MeasurementUnit } from '@/lib/unit-conversion';

const UNITS = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'Quilograma(s)' },
  { value: 'g', label: 'Grama(s)' },
  { value: 'L', label: 'Litro(s)' },
  { value: 'ml', label: 'Mililitro(s)' },
  { value: 'm', label: 'Metro(s)' },
  { value: 'cm', label: 'Centímetro(s)' },
] as const;

export interface SelectedRecipe {
  recipe_id: string;
  quantity: number;
  unit: string;
  name: string;
  yield_quantity: number;
  yield_unit: string;
}

interface RecipeSelectorProps {
  selectedRecipes: SelectedRecipe[];
  onRecipesChange: (recipes: SelectedRecipe[]) => void;
  recipeCosts?: Record<string, number>;
  linkedIds?: string[];
}

export function RecipeSelector({
  selectedRecipes,
  onRecipesChange,
  recipeCosts = {},
  linkedIds,
}: RecipeSelectorProps) {
  const hasLinked = linkedIds && linkedIds.length > 0;
  const { recipes } = useRecipes(hasLinked ? { includeInactive: true } : undefined);
  
  const [open, setOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('un');

  const availableRecipes = useMemo(() => {
    const selectedIds = new Set(selectedRecipes.map(r => r.recipe_id));
    return recipes.filter(r => !selectedIds.has(r.id) && r.is_active !== false);
  }, [recipes, selectedRecipes]);

  const compatibleUnits = useMemo(() => {
    if (!selectedRecipe) return UNITS;
    const yieldUnit = selectedRecipe.yield_unit;
    if (yieldUnit === 'un') return UNITS.filter(u => u.value === 'un');
    if (['kg', 'g'].includes(yieldUnit)) return UNITS.filter(u => ['kg', 'g'].includes(u.value));
    if (['L', 'ml'].includes(yieldUnit)) return UNITS.filter(u => ['L', 'ml'].includes(u.value));
    if (['m', 'cm'].includes(yieldUnit)) return UNITS.filter(u => ['m', 'cm'].includes(u.value));
    return UNITS;
  }, [selectedRecipe]);

  const handleSelectRecipe = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setUnit(recipe.yield_unit);
    setOpen(false);
  };

  const handleAddRecipe = () => {
    if (!selectedRecipe || !quantity || Number(quantity) <= 0) return;

    const newRecipe: SelectedRecipe = {
      recipe_id: selectedRecipe.id,
      quantity: Number(quantity),
      unit,
      name: selectedRecipe.name,
      yield_quantity: selectedRecipe.yield_quantity,
      yield_unit: selectedRecipe.yield_unit,
    };

    onRecipesChange([...selectedRecipes, newRecipe]);
    setSelectedRecipe(null);
    setQuantity('');
  };

  const handleRemoveRecipe = (recipeId: string) => {
    onRecipesChange(selectedRecipes.filter(r => r.recipe_id !== recipeId));
  };

  const handleUpdateQuantity = (recipeId: string, newQuantity: number) => {
    onRecipesChange(
      selectedRecipes.map(r => 
        r.recipe_id === recipeId ? { ...r, quantity: newQuantity } : r
      )
    );
  };

  const handleUpdateUnit = (recipeId: string, newUnit: string) => {
    onRecipesChange(
      selectedRecipes.map(r => 
        r.recipe_id === recipeId ? { ...r, unit: newUnit } : r
      )
    );
  };

  const getItemCost = (item: SelectedRecipe): number | null => {
    const totalCost = recipeCosts[item.recipe_id];
    if (totalCost == null) return null;
    const convertedQty = convertUnit(
      item.quantity,
      item.unit as MeasurementUnit,
      item.yield_unit as MeasurementUnit
    ) ?? item.quantity;
    const proportion = convertedQty / item.yield_quantity;
    return totalCost * proportion;
  };

  const CommandContent = (
    <Command>
      <CommandInput placeholder="Buscar receita..." />
      <CommandList>
        <CommandEmpty>Nenhuma receita encontrada.</CommandEmpty>
        <CommandGroup>
          {availableRecipes.map((recipe) => {
            const cost = recipeCosts[recipe.id];
            return (
              <CommandItem
                key={recipe.id}
                value={recipe.name}
                onSelect={() => handleSelectRecipe(recipe)}
                className="py-3"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedRecipe?.id === recipe.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col flex-1">
                  <span>{recipe.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Rende: {recipe.yield_quantity} {recipe.yield_unit}
                    {cost != null && ` · ${formatCurrency(cost)}`}
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
      <Label className="text-base font-medium">Receitas</Label>

      {/* Add Recipe Section */}
      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Recipe Selector */}
          <div className="sm:col-span-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between min-h-[44px]"
                >
                  {selectedRecipe ? (
                    <span className="truncate">{selectedRecipe.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Selecionar receita...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[300px] p-0">
                {CommandContent}
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity */}
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={selectedRecipe ? String(selectedRecipe.yield_quantity) : 'Qtd'}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedRecipe}
              autoComplete="off"
              className="flex-1 min-h-[44px]"
            />
            <Select
              value={unit}
              onValueChange={setUnit}
              disabled={!selectedRecipe}
            >
              <SelectTrigger className="w-24 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {compatibleUnits.map((u) => (
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
            onClick={handleAddRecipe}
            disabled={!selectedRecipe || !quantity || Number(quantity) <= 0}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Selected Recipes List */}
      {selectedRecipes.length > 0 ? (
        <div className="space-y-2">
          {selectedRecipes.map((item) => {
            const yieldUnit = item.yield_unit;
            let itemCompatibleUnits: typeof UNITS[number][] = [...UNITS];
            if (yieldUnit === 'un') itemCompatibleUnits = UNITS.filter(u => u.value === 'un');
            else if (['kg', 'g'].includes(yieldUnit)) itemCompatibleUnits = UNITS.filter(u => ['kg', 'g'].includes(u.value));
            else if (['L', 'ml'].includes(yieldUnit)) itemCompatibleUnits = UNITS.filter(u => ['L', 'ml'].includes(u.value));
            else if (['m', 'cm'].includes(yieldUnit)) itemCompatibleUnits = UNITS.filter(u => ['m', 'cm'].includes(u.value));

            const itemCost = getItemCost(item);

            return (
              <div
                key={item.recipe_id}
                className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                    {recipes.find(r => r.id === item.recipe_id)?.is_active === false && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Inativo)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rende: {item.yield_quantity} {item.yield_unit}
                    {itemCost != null && (
                      <span className="text-primary font-medium"> · {formatCurrency(itemCost)}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.recipe_id, Number(e.target.value))}
                    autoComplete="off"
                    className="w-16 sm:w-20 min-h-[44px]"
                  />
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleUpdateUnit(item.recipe_id, value)}
                  >
                    <SelectTrigger className="w-16 sm:w-20 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {itemCompatibleUnits.map((u) => (
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
                    onClick={() => handleRemoveRecipe(item.recipe_id)}
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
          <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma receita adicionada</p>
          <p className="text-sm">Selecione receitas acima para adicionar ao produto</p>
        </div>
      )}
    </div>
  );
}