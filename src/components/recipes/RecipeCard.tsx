import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Recipe } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useUserSettings } from '@/hooks/useUserSettings';
import { calculateRecipeCost, type IngredientData, type TimeBasedCostSettings } from '@/lib/recipe-cost-calculator';
import { formatCurrency, type MeasurementUnit } from '@/lib/unit-conversion';
import { 
  Pencil, 
  Trash2, 
  Clock, 
  Flame, 
  Eye,
  TrendingUp
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onView: () => void;
}

export function RecipeCard({ recipe, onEdit, onDelete, onDuplicate, onView }: RecipeCardProps) {
  const { ingredients } = useIngredients();
  const { settings } = useUserSettings();

  const costBreakdown = useMemo(() => {
    if (!recipe.recipe_ingredients?.length) return null;

    const ingredientsData: IngredientData[] = ingredients.map(i => ({
      id: i.id,
      name: i.name,
      purchase_price: Number(i.purchase_price),
      package_quantity: Number(i.package_quantity),
      unit: i.unit,
      cost_per_unit: Number(i.cost_per_unit),
    }));

    const recipeIngredients = recipe.recipe_ingredients.map(ri => ({
      ingredient_id: ri.ingredient_id,
      quantity: Number(ri.quantity),
      unit: ri.unit,
    }));

    const safetyMargin = recipe.safety_margin_percent ?? settings?.default_safety_margin ?? 15;
    const additionalCosts = Number(recipe.additional_costs) || 0;

    const timeSettings: TimeBasedCostSettings = {
      ovenType: (settings?.oven_type as 'gas' | 'electric' | 'both') || 'gas',
      includeGasCost: settings?.include_gas_cost || false,
      gasCostPerHour: Number(settings?.gas_cost_per_hour) || 0,
      electricOvenCostPerHour: Number(settings?.electric_oven_cost_per_hour) || 0,
      defaultOvenType: (settings?.default_oven_type as 'gas' | 'electric') || 'gas',
      includeEnergyCost: settings?.include_energy_cost || false,
      energyCostPerHour: Number(settings?.energy_cost_per_hour) || 0,
      includeLaborCost: settings?.include_labor_cost || false,
      laborCostPerHour: Number(settings?.labor_cost_per_hour) || 0,
    };

    return calculateRecipeCost(
      recipeIngredients,
      ingredientsData,
      Number(recipe.yield_quantity),
      (recipe.yield_unit as MeasurementUnit) || 'un',
      safetyMargin,
      additionalCosts,
      Number(recipe.prep_time_minutes) || 0,
      Number(recipe.oven_time_minutes) || 0,
      timeSettings
    );
  }, [recipe, ingredients, settings]);

  const ingredientCount = recipe.recipe_ingredients?.length || 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {recipe.recipe_categories && (
            <Badge
              variant="secondary"
              className="text-xs max-w-[100px] truncate mb-1"
              style={{
                backgroundColor: `${recipe.recipe_categories.color}20`,
                color: recipe.recipe_categories.color,
                borderColor: recipe.recipe_categories.color,
              }}
            >
              {recipe.recipe_categories.name}
            </Badge>
          )}
          <h3 className="font-semibold text-foreground truncate">{recipe.name}</h3>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Components summary */}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <Badge variant="outline">{ingredientCount} ingrediente{ingredientCount > 1 ? 's' : ''}</Badge>
      </div>

      {/* Time info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{recipe.prep_time_minutes}min preparo</span>
        </div>
        {recipe.oven_time_minutes && recipe.oven_time_minutes > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-destructive" />
            <span>{recipe.oven_time_minutes}min forno</span>
          </div>
        )}
      </div>

      {/* Yield */}
      <div className="text-sm text-muted-foreground mb-3">
        Rende: <span className="font-medium text-foreground">{recipe.yield_quantity} {recipe.yield_unit}</span>
      </div>

      {/* Costs */}
      {costBreakdown && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Custo Total</span>
            <span className="font-medium text-foreground">{formatCurrency(costBreakdown.totalCost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Custo por {recipe.yield_unit}</span>
            <span className="font-bold text-primary text-lg">
              {formatCurrency(costBreakdown.costPerUnit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
