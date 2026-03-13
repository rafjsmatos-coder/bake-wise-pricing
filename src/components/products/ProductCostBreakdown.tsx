import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, ProductCostBreakdown as CostBreakdownType } from '@/lib/product-cost-calculator';
import { BookOpen, Package, Sparkles, Box, Clock, Plus, TrendingUp, HardHat } from 'lucide-react';

interface ProductCostBreakdownProps {
  breakdown: CostBreakdownType;
}

export function ProductCostBreakdown({ breakdown }: ProductCostBreakdownProps) {
  const costItems = [
    { 
      label: 'Receitas', 
      value: breakdown.recipesCost, 
      icon: BookOpen,
      show: breakdown.recipesCost > 0 
    },
    { 
      label: 'Ingredientes Avulsos', 
      value: breakdown.ingredientsCost, 
      icon: Package,
      show: breakdown.ingredientsCost > 0 
    },
    { 
      label: 'Decorações', 
      value: breakdown.decorationsCost, 
      icon: Sparkles,
      show: breakdown.decorationsCost > 0 
    },
    { 
      label: 'Embalagens', 
      value: breakdown.packagingCost, 
      icon: Box,
      show: breakdown.packagingCost > 0 
    },
    { 
      label: 'Seu Tempo (Decoração)', 
      value: breakdown.laborCost, 
      icon: Clock,
      show: breakdown.laborCost > 0 
    },
    { 
      label: 'Custos Adicionais', 
      value: breakdown.additionalCosts, 
      icon: Plus,
      show: breakdown.additionalCosts > 0 
    },
  ];

  const visibleItems = costItems.filter(item => item.show);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detalhamento de Custos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost breakdown */}
        <div className="space-y-2">
          {visibleItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
          ))}
          
          {visibleItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum custo adicionado ainda
            </p>
          )}
        </div>

        {visibleItems.length > 0 && (
          <>
            <Separator />

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
            </div>

            {/* Indirect Operational Cost */}
            {breakdown.indirectOperationalCost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardHat className="h-4 w-4" />
                  <span>Outros Gastos ({breakdown.indirectOperationalCostPercent}%)</span>
                </div>
                <span className="font-medium text-amber-600">
                  + {formatCurrency(breakdown.indirectOperationalCost)}
                </span>
              </div>
            )}
          </>
        )}

        <Separator />

        {/* Total production cost */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Quanto custa produzir</span>
          <span className="font-bold">{formatCurrency(breakdown.totalProductionCost)}</span>
        </div>

        <Separator />

        {/* Profit margin */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Margem de Lucro ({breakdown.profitMarginPercent}%)</span>
          </div>
          <span className="font-medium text-green-600">
            + {formatCurrency(breakdown.profitAmount)}
          </span>
        </div>

        <Separator />

        {/* Final price */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Preço de Venda Sugerido</span>
          <span className="font-bold text-primary text-xl">
            {formatCurrency(breakdown.suggestedSellingPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
