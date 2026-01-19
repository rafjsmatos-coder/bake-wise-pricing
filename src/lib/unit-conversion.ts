// Unit conversion utilities for the pricing system

export type MeasurementUnit = 'kg' | 'g' | 'L' | 'ml' | 'un';

export interface UnitInfo {
  label: string;
  labelPlural: string;
  baseUnit: MeasurementUnit | null;
  conversionFactor: number;
  type: 'weight' | 'volume' | 'unit';
}

export const UNITS: Record<MeasurementUnit, UnitInfo> = {
  kg: {
    label: 'quilograma',
    labelPlural: 'quilogramas',
    baseUnit: 'g',
    conversionFactor: 1000,
    type: 'weight',
  },
  g: {
    label: 'grama',
    labelPlural: 'gramas',
    baseUnit: null,
    conversionFactor: 1,
    type: 'weight',
  },
  L: {
    label: 'litro',
    labelPlural: 'litros',
    baseUnit: 'ml',
    conversionFactor: 1000,
    type: 'volume',
  },
  ml: {
    label: 'mililitro',
    labelPlural: 'mililitros',
    baseUnit: null,
    conversionFactor: 1,
    type: 'volume',
  },
  un: {
    label: 'unidade',
    labelPlural: 'unidades',
    baseUnit: null,
    conversionFactor: 1,
    type: 'unit',
  },
};

export function getUnitLabel(unit: MeasurementUnit, quantity: number = 1): string {
  const info = UNITS[unit];
  return quantity === 1 ? info.label : info.labelPlural;
}

export function convertToBaseUnit(value: number, unit: MeasurementUnit): number {
  const info = UNITS[unit];
  return value * info.conversionFactor;
}

export function convertFromBaseUnit(value: number, unit: MeasurementUnit): number {
  const info = UNITS[unit];
  return value / info.conversionFactor;
}

export function convertUnit(
  value: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit
): number | null {
  const fromInfo = UNITS[fromUnit];
  const toInfo = UNITS[toUnit];

  // Can only convert between same type
  if (fromInfo.type !== toInfo.type) {
    return null;
  }

  if (fromInfo.type === 'unit') {
    return value; // No conversion for units
  }

  // Convert to base unit, then to target unit
  const baseValue = convertToBaseUnit(value, fromUnit);
  return convertFromBaseUnit(baseValue, toUnit);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getCostPerUnit(
  purchasePrice: number,
  packageQuantity: number,
  unit: MeasurementUnit
): { value: number; displayUnit: MeasurementUnit; formatted: string } {
  const info = UNITS[unit];
  
  // For kg and L, show cost per g and ml respectively for better precision
  if (info.baseUnit) {
    const totalBaseUnits = packageQuantity * info.conversionFactor;
    const costPerBaseUnit = purchasePrice / totalBaseUnits;
    return {
      value: costPerBaseUnit,
      displayUnit: info.baseUnit,
      formatted: `${formatCurrency(costPerBaseUnit)}/${info.baseUnit}`,
    };
  }

  const costPerUnit = purchasePrice / packageQuantity;
  return {
    value: costPerUnit,
    displayUnit: unit,
    formatted: `${formatCurrency(costPerUnit)}/${unit}`,
  };
}
