import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Recipe } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useUserSettings } from '@/hooks/useUserSettings';
import { CostBreakdown } from './CostBreakdown';
import { calculateRecipeCost, type IngredientData, type TimeBasedCostSettings } from '@/lib/recipe-cost-calculator';
import { UNITS, type MeasurementUnit } from '@/lib/unit-conversion';
import { 
  Clock, 
  Flame, 
  Package, 
  Edit, 
  Copy, 
  BookOpen,
  StickyNote
} from 'lucide-react';

interface RecipeDetailsProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

export function RecipeDetails({ recipe, open, onOpenChange, onEdit, onDuplicate }: RecipeDetailsProps) {
  const { ingredients } = useIngredients();
  const { settings } = useUserSettings();

  const costBreakdown = useMemo(() => {
    if (!recipe?.recipe_ingredients?.length) return null;

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

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
              {recipe.recipe_categories && (
                <Badge
                  variant="secondary"
                  className="mt-2"
                  style={{
                    backgroundColor: `${recipe.recipe_categories.color}20`,
                    color: recipe.recipe_categories.color,
                    borderColor: recipe.recipe_categories.color,
                  }}
                >
                  {recipe.recipe_categories.name}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{recipe.yield_quantity}</div>
              <div className="text-xs text-muted-foreground">{recipe.yield_unit}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{recipe.prep_time_minutes}</div>
              <div className="text-xs text-muted-foreground">min preparo</div>
            </div>
            {recipe.oven_time_minutes && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <div className="text-lg font-bold">{recipe.oven_time_minutes}</div>
                <div className="text-xs text-muted-foreground">min forno</div>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{recipe.recipe_ingredients?.length || 0}</div>
              <div className="text-xs text-muted-foreground">ingredientes</div>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ingredientes
            </h3>
            <div className="bg-muted/30 rounded-lg divide-y divide-border">
              {recipe.recipe_ingredients?.map((ri) => {
                const ingredient = ri.ingredients || ingredients.find(i => i.id === ri.ingredient_id);
                return (
                  <div key={ri.id} className="flex justify-between items-center p-3">
                    <span>{ingredient?.name || 'Ingrediente'}</span>
                    <span className="font-medium">
                      {ri.quantity} {ri.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          {costBreakdown && (
            <CostBreakdown breakdown={costBreakdown} />
          )}

          {/* Instructions */}
          {recipe.instructions && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Modo de Preparo
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {recipe.instructions}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Observações
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {recipe.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
