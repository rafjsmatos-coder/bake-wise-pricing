import { formatCurrency, getUnitLabel } from '@/lib/unit-conversion';
import { type RecipeCostBreakdown } from '@/lib/recipe-cost-calculator';
import { Calculator, TrendingUp, Package, DollarSign, Percent, Flame, Zap, User } from 'lucide-react';

interface CostBreakdownProps {
  breakdown: RecipeCostBreakdown;
  compact?: boolean;
}

export function CostBreakdown({ breakdown, compact = false }: CostBreakdownProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Total: <span className="font-medium">{formatCurrency(breakdown.totalCost)}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-accent" />
          <span>Por unidade: <span className="font-bold text-accent">{formatCurrency(breakdown.costPerUnit)}</span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <Calculator className="h-5 w-5" />
        <h3 className="font-semibold">Detalhamento de Custos</h3>
      </div>

      <div className="space-y-3">
        {/* Ingredientes */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Custo dos ingredientes</span>
          </div>
          <span className="font-medium">{formatCurrency(breakdown.ingredientsCost)}</span>
        </div>

        {/* Margem de segurança */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            <span>Margem de segurança ({breakdown.safetyMarginPercent}%)</span>
          </div>
          <span className="font-medium">+ {formatCurrency(breakdown.safetyMarginAmount)}</span>
        </div>

        {/* Custo de Gás */}
        {breakdown.gasCost > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Custo de gás ({breakdown.ovenTimeMinutes} min forno)</span>
            </div>
            <span className="font-medium">+ {formatCurrency(breakdown.gasCost)}</span>
          </div>
        )}

        {/* Custo de Energia */}
        {breakdown.energyCost > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Custo de energia ({breakdown.prepTimeMinutes} min preparo)</span>
            </div>
            <span className="font-medium">+ {formatCurrency(breakdown.energyCost)}</span>
          </div>
        )}

        {/* Custo de Mão de Obra */}
        {breakdown.laborCost > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 text-blue-500" />
              <span>Mão de obra ({breakdown.prepTimeMinutes} min preparo)</span>
            </div>
            <span className="font-medium">+ {formatCurrency(breakdown.laborCost)}</span>
          </div>
        )}

        {/* Custos adicionais */}
        {breakdown.additionalCosts > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Custos adicionais</span>
            </div>
            <span className="font-medium">+ {formatCurrency(breakdown.additionalCosts)}</span>
          </div>
        )}

        {/* Custo Total */}
        <div className="flex justify-between items-center py-3 bg-muted/50 rounded-lg px-3 -mx-1">
          <span className="font-semibold">Custo Total da Receita</span>
          <span className="text-lg font-bold">{formatCurrency(breakdown.totalCost)}</span>
        </div>

        {/* Custo por unidade - Destaque */}
        <div className="flex justify-between items-center py-3 bg-accent/10 rounded-lg px-3 -mx-1 border border-accent/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <div>
              <span className="font-semibold text-accent">Custo por {getUnitLabel(breakdown.yieldUnit, 1)}</span>
              <p className="text-xs text-muted-foreground">
                Rendimento: {breakdown.yieldQuantity} {getUnitLabel(breakdown.yieldUnit, breakdown.yieldQuantity)}
              </p>
            </div>
          </div>
          <span className="text-xl font-bold text-accent">
            {formatCurrency(breakdown.costPerUnit)}
          </span>
        </div>
      </div>

      {/* Breakdown por ingrediente */}
      {breakdown.ingredients.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Por ingrediente:</h4>
          <div className="space-y-1">
            {breakdown.ingredients.map((ing) => (
              <div key={ing.ingredientId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {ing.ingredientName} ({ing.quantity}{ing.unit})
                </span>
                <span>{formatCurrency(ing.totalCost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
