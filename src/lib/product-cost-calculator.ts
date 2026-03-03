import { convertToBaseUnit } from './unit-conversion';
import type { Product } from '@/hooks/useProducts';

export interface RecipeCostData {
  id: string;
  name: string;
  totalCost: number;
}

export interface ProductCostBreakdown {
  recipesCost: number;
  ingredientsCost: number;
  decorationsCost: number;
  packagingCost: number;
  laborCost: number;
  additionalCosts: number;
  subtotal: number;
  indirectOperationalCost: number;
  indirectOperationalCostPercent: number;
  totalProductionCost: number;
  profitMarginPercent: number;
  profitAmount: number;
  suggestedSellingPrice: number;
}

interface CalculateProductCostParams {
  product: Product;
  recipeCosts: Record<string, number>; // recipe_id -> total cost
  laborCostPerHour: number;
  indirectOperationalCostPercent?: number;
}

export function calculateProductCost({
  product,
  recipeCosts,
  laborCostPerHour,
  indirectOperationalCostPercent = 5,
}: CalculateProductCostParams): ProductCostBreakdown {
  // Calculate recipes cost with proportional calculation
  let recipesCost = 0;
  if (product.product_recipes) {
    for (const pr of product.product_recipes) {
      const recipeTotalCost = recipeCosts[pr.recipe_id] || 0;
      const recipe = pr.recipe;
      
      if (recipe && recipe.yield_quantity > 0) {
        // Convert both to base units for proper comparison
        const requestedInBase = convertToBaseUnit(pr.quantity, pr.unit as any || recipe.yield_unit);
        const yieldInBase = convertToBaseUnit(recipe.yield_quantity, recipe.yield_unit as any);
        
        // Calculate proportion of recipe used
        const proportion = yieldInBase > 0 ? requestedInBase / yieldInBase : 1;
        recipesCost += recipeTotalCost * proportion;
      } else {
        // Fallback: use quantity as multiplier
        recipesCost += recipeTotalCost * pr.quantity;
      }
    }
  }

  // Calculate loose ingredients cost
  let ingredientsCost = 0;
  if (product.product_ingredients) {
    for (const pi of product.product_ingredients) {
      if (pi.ingredient?.cost_per_unit) {
        const quantityInBaseUnit = convertToBaseUnit(pi.quantity, pi.unit);
        const ingredientBaseUnit = convertToBaseUnit(1, pi.ingredient.unit);
        const costPerBaseUnit = pi.ingredient.cost_per_unit / ingredientBaseUnit;
        ingredientsCost += quantityInBaseUnit * costPerBaseUnit;
      }
    }
  }

  // Calculate decorations cost
  let decorationsCost = 0;
  if (product.product_decorations) {
    for (const pd of product.product_decorations) {
      const decoration = pd.decoration;
      if (decoration) {
        const effectiveCostPerUnit = decoration.cost_per_unit ?? (decoration as any).purchase_price / (decoration as any).package_quantity;
        if (effectiveCostPerUnit) {
          const quantityInBaseUnit = convertToBaseUnit(pd.quantity, pd.unit);
          const decorationBaseUnit = convertToBaseUnit(1, decoration.unit);
          const costPerBaseUnit = effectiveCostPerUnit / decorationBaseUnit;
          decorationsCost += quantityInBaseUnit * costPerBaseUnit;
        }
      }
    }
  }

  // Calculate packaging cost
  let packagingCost = 0;
  if (product.product_packaging) {
    for (const pp of product.product_packaging) {
      if (pp.packaging?.cost_per_unit) {
        packagingCost += pp.packaging.cost_per_unit * pp.quantity;
      }
    }
  }

  // Calculate labor cost (decoration time)
  const decorationTimeHours = (product.decoration_time_minutes || 0) / 60;
  const laborCost = decorationTimeHours * laborCostPerHour;

  // Additional costs
  const additionalCosts = product.additional_costs || 0;

  // Calculate subtotal (before indirect operational cost)
  const subtotal = 
    recipesCost + 
    ingredientsCost + 
    decorationsCost + 
    packagingCost + 
    laborCost + 
    additionalCosts;

  // Calculate indirect operational cost
  const indirectOperationalCost = subtotal * (indirectOperationalCostPercent / 100);

  // Total production cost
  const totalProductionCost = subtotal + indirectOperationalCost;

  // Profit calculation
  const profitMarginPercent = product.profit_margin_percent || 30;
  const profitAmount = totalProductionCost * (profitMarginPercent / 100);
  const suggestedSellingPrice = totalProductionCost + profitAmount;

  return {
    recipesCost,
    ingredientsCost,
    decorationsCost,
    packagingCost,
    laborCost,
    additionalCosts,
    subtotal,
    indirectOperationalCost,
    indirectOperationalCostPercent,
    totalProductionCost,
    profitMarginPercent,
    profitAmount,
    suggestedSellingPrice,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
