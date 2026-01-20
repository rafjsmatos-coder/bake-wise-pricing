import { type MeasurementUnit, convertToBaseUnit, UNITS } from './unit-conversion';

export interface RecipeIngredientCost {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: MeasurementUnit;
  costPerUnit: number;
  totalCost: number;
}

export interface RecipeCostBreakdown {
  ingredientsCost: number;
  safetyMarginAmount: number;
  safetyMarginPercent: number;
  additionalCosts: number;
  gasCost: number;
  energyCost: number;
  laborCost: number;
  totalCost: number;
  costPerUnit: number;
  yieldQuantity: number;
  prepTimeMinutes: number;
  ovenTimeMinutes: number;
  ingredients: RecipeIngredientCost[];
}

export interface IngredientData {
  id: string;
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  cost_per_unit: number;
}

export interface RecipeIngredientInput {
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
}

export interface TimeBasedCostSettings {
  includeGasCost: boolean;
  gasCostPerHour: number;
  includeEnergyCost: boolean;
  energyCostPerHour: number;
  includeLaborCost: boolean;
  laborCostPerHour: number;
}

/**
 * Calculates the cost of a single ingredient usage in a recipe
 * Handles unit conversion (e.g., recipe uses 500g, ingredient is stored in kg)
 */
export function calculateIngredientCost(
  recipeQuantity: number,
  recipeUnit: MeasurementUnit,
  ingredientPurchasePrice: number,
  ingredientPackageQuantity: number,
  ingredientUnit: MeasurementUnit
): number {
  // Convert both to base units for comparison
  const recipeInBase = convertToBaseUnit(recipeQuantity, recipeUnit);
  const packageInBase = convertToBaseUnit(ingredientPackageQuantity, ingredientUnit);

  // Check if units are compatible (same type: mass or volume or units)
  const recipeType = UNITS[recipeUnit].type;
  const ingredientType = UNITS[ingredientUnit].type;

  if (recipeType !== ingredientType) {
    console.warn(`Incompatible units: ${recipeUnit} and ${ingredientUnit}`);
    return 0;
  }

  // Cost per base unit
  const costPerBaseUnit = ingredientPurchasePrice / packageInBase;
  
  // Total cost for recipe quantity
  return recipeInBase * costPerBaseUnit;
}

/**
 * Calculates time-based costs (gas, energy, labor)
 */
export function calculateTimeBasedCosts(
  prepTimeMinutes: number,
  ovenTimeMinutes: number,
  settings: TimeBasedCostSettings
): { gasCost: number; energyCost: number; laborCost: number } {
  const ovenHours = (ovenTimeMinutes || 0) / 60;
  const prepHours = (prepTimeMinutes || 0) / 60;

  // Gás: calculado sobre tempo de forno (custo indireto - equipamento)
  const gasCost = settings.includeGasCost ? ovenHours * settings.gasCostPerHour : 0;
  // Energia: calculado sobre tempo de preparo (equipamentos elétricos em uso)
  const energyCost = settings.includeEnergyCost ? prepHours * settings.energyCostPerHour : 0;
  // Mão de obra: calculado apenas sobre tempo de preparo (trabalho ativo)
  const laborCost = settings.includeLaborCost ? prepHours * settings.laborCostPerHour : 0;

  return { gasCost, energyCost, laborCost };
}

/**
 * Calculates the complete cost breakdown for a recipe
 */
export function calculateRecipeCost(
  recipeIngredients: RecipeIngredientInput[],
  ingredientsData: IngredientData[],
  yieldQuantity: number,
  safetyMarginPercent: number = 15,
  additionalCosts: number = 0,
  prepTimeMinutes: number = 0,
  ovenTimeMinutes: number = 0,
  timeSettings?: TimeBasedCostSettings
): RecipeCostBreakdown {
  const ingredientCosts: RecipeIngredientCost[] = [];
  let totalIngredientsCost = 0;

  for (const recipeIngredient of recipeIngredients) {
    const ingredientData = ingredientsData.find(i => i.id === recipeIngredient.ingredient_id);
    
    if (!ingredientData) continue;

    const cost = calculateIngredientCost(
      recipeIngredient.quantity,
      recipeIngredient.unit,
      ingredientData.purchase_price,
      ingredientData.package_quantity,
      ingredientData.unit
    );

    ingredientCosts.push({
      ingredientId: ingredientData.id,
      ingredientName: ingredientData.name,
      quantity: recipeIngredient.quantity,
      unit: recipeIngredient.unit,
      costPerUnit: ingredientData.cost_per_unit,
      totalCost: cost,
    });

    totalIngredientsCost += cost;
  }

  // Calculate time-based costs
  const defaultTimeSettings: TimeBasedCostSettings = {
    includeGasCost: false,
    gasCostPerHour: 0,
    includeEnergyCost: false,
    energyCostPerHour: 0,
    includeLaborCost: false,
    laborCostPerHour: 0,
  };
  const effectiveTimeSettings = timeSettings || defaultTimeSettings;
  const { gasCost, energyCost, laborCost } = calculateTimeBasedCosts(
    prepTimeMinutes,
    ovenTimeMinutes,
    effectiveTimeSettings
  );

  const safetyMarginAmount = totalIngredientsCost * (safetyMarginPercent / 100);
  const totalCost = totalIngredientsCost + safetyMarginAmount + additionalCosts + gasCost + energyCost + laborCost;
  const costPerUnit = yieldQuantity > 0 ? totalCost / yieldQuantity : 0;

  return {
    ingredientsCost: totalIngredientsCost,
    safetyMarginAmount,
    safetyMarginPercent,
    additionalCosts,
    gasCost,
    energyCost,
    laborCost,
    totalCost,
    costPerUnit,
    yieldQuantity,
    prepTimeMinutes,
    ovenTimeMinutes,
    ingredients: ingredientCosts,
  };
}

/**
 * Formats the cost breakdown for display
 */
export function formatCostBreakdown(breakdown: RecipeCostBreakdown): string {
  const lines = [
    `Custo dos ingredientes: R$ ${breakdown.ingredientsCost.toFixed(2)}`,
    `Margem de segurança (${breakdown.safetyMarginPercent}%): R$ ${breakdown.safetyMarginAmount.toFixed(2)}`,
  ];

  if (breakdown.gasCost > 0) {
    lines.push(`Custo de gás: R$ ${breakdown.gasCost.toFixed(2)}`);
  }

  if (breakdown.energyCost > 0) {
    lines.push(`Custo de energia: R$ ${breakdown.energyCost.toFixed(2)}`);
  }

  if (breakdown.laborCost > 0) {
    lines.push(`Custo de mão de obra: R$ ${breakdown.laborCost.toFixed(2)}`);
  }

  if (breakdown.additionalCosts > 0) {
    lines.push(`Custos adicionais: R$ ${breakdown.additionalCosts.toFixed(2)}`);
  }

  lines.push(
    `Custo total: R$ ${breakdown.totalCost.toFixed(2)}`,
    `Custo por unidade: R$ ${breakdown.costPerUnit.toFixed(2)}`
  );

  return lines.join('\n');
}

/**
 * Gets compatible units for an ingredient based on its stored unit
 */
export function getCompatibleUnits(ingredientUnit: MeasurementUnit): MeasurementUnit[] {
  const unitType = UNITS[ingredientUnit].type;
  return (Object.entries(UNITS) as [MeasurementUnit, typeof UNITS[MeasurementUnit]][])
    .filter(([_, info]) => info.type === unitType)
    .map(([unit]) => unit);
}
