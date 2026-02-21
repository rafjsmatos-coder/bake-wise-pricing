// Unit conversion utilities for the pricing system

export type MeasurementUnit = 'kg' | 'g' | 'L' | 'ml' | 'un' | 'm' | 'cm';

export interface UnitInfo {
  label: string;
  labelPlural: string;
  baseUnit: MeasurementUnit | null;
  conversionFactor: number;
  type: 'weight' | 'volume' | 'unit' | 'length';
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
  m: {
    label: 'metro',
    labelPlural: 'metros',
    baseUnit: 'cm',
    conversionFactor: 100,
    type: 'length',
  },
  cm: {
    label: 'centímetro',
    labelPlural: 'centímetros',
    baseUnit: null,
    conversionFactor: 1,
    type: 'length',
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

export function getCompatibleUnits(unit: MeasurementUnit): MeasurementUnit[] {
  const info = UNITS[unit];
  if (info.type === 'unit') return [unit];
  return (Object.entries(UNITS) as [MeasurementUnit, UnitInfo][])
    .filter(([, u]) => u.type === info.type)
    .map(([key]) => key);
}

/**
 * Returns the fractional (smaller) unit for a given unit.
 * kg → g, L → ml, m → cm. Units without a base unit return themselves.
 */
export function getFractionalUnit(unit: MeasurementUnit): MeasurementUnit {
  const info = UNITS[unit];
  return info.baseUnit || unit;
}

export function getBestDisplayUnit(
  value: number | null | undefined,
  mainUnit: MeasurementUnit
): { displayValue: number; displayUnit: MeasurementUnit } {
  if (value == null || value === 0) {
    return { displayValue: value ?? 0, displayUnit: mainUnit };
  }

  const info = UNITS[mainUnit];
  if (info.type === 'unit' || !info.baseUnit) {
    return { displayValue: value, displayUnit: mainUnit };
  }

  // Convert to base unit and check if it's a cleaner number
  const baseValue = convertToBaseUnit(value, mainUnit);
  // If the base value is a whole number or has fewer decimals, use it
  const mainDecimals = countSignificantDecimals(value);
  const baseDecimals = countSignificantDecimals(baseValue);

  if (baseDecimals < mainDecimals || (baseValue >= 1 && value < 1)) {
    return { displayValue: baseValue, displayUnit: info.baseUnit };
  }

  return { displayValue: value, displayUnit: mainUnit };
}

function countSignificantDecimals(n: number): number {
  const s = n.toString();
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
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
