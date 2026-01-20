import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Recipe } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useUserSettings } from '@/hooks/useUserSettings';
import { calculateRecipeCost, type IngredientData } from '@/lib/recipe-cost-calculator';
import { formatCurrency } from '@/lib/unit-conversion';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Clock, 
  Flame, 
  Package,
  TrendingUp,
  Eye 
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

    return calculateRecipeCost(
      recipeIngredients,
      ingredientsData,
      Number(recipe.yield_quantity),
      safetyMargin,
      additionalCosts
    );
  }, [recipe, ingredients, settings]);

  const ingredientCount = recipe.recipe_ingredients?.length || 0;

  return (
    <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-accent/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {recipe.name}
          </h3>
          {recipe.recipe_categories && (
            <Badge
              variant="secondary"
              className="mt-1"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          <span>{ingredientCount} ingredientes</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{recipe.prep_time_minutes} min</span>
        </div>
        {recipe.oven_time_minutes && (
          <div className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>{recipe.oven_time_minutes} min</span>
          </div>
        )}
      </div>

      {/* Yield */}
      <div className="text-sm text-muted-foreground mb-3">
        Rende: <span className="font-medium text-foreground">{recipe.yield_quantity} {recipe.yield_unit}</span>
      </div>

      {/* Cost */}
      {costBreakdown && (
        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total: {formatCurrency(costBreakdown.totalCost)}
            </div>
            <div className="flex items-center gap-1.5 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold">
                {formatCurrency(costBreakdown.costPerUnit)}/un
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
