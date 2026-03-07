import { Ingredient } from '@/hooks/useIngredients';
import { formatCurrency, formatNumber, getCostPerUnit, getBestDisplayUnit, type MeasurementUnit } from '@/lib/unit-conversion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PriceHistoryChart } from './PriceHistoryChart';
import { AlertTriangle, Calendar, Package } from 'lucide-react';
import { format, isPast, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IngredientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: Ingredient | null;
}

export function IngredientDetails({ open, onOpenChange, ingredient }: IngredientDetailsProps) {
  if (!ingredient) return null;

  const costInfo = getCostPerUnit(
    Number(ingredient.purchase_price),
    Number(ingredient.package_quantity),
    ingredient.unit
  );

  const expiryDate = ingredient.expiry_date ? parseISO(ingredient.expiry_date) : null;
  const isExpired = expiryDate ? isPast(expiryDate) : false;
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, new Date()) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;

  const isLowStock = ingredient.min_stock_alert &&
    ingredient.stock_quantity !== null &&
    Number(ingredient.stock_quantity) <= Number(ingredient.min_stock_alert);

  const stockDisplay = ingredient.stock_quantity !== null
    ? getBestDisplayUnit(Number(ingredient.stock_quantity), ingredient.unit as MeasurementUnit)
    : null;

  const alertDisplay = ingredient.min_stock_alert
    ? getBestDisplayUnit(Number(ingredient.min_stock_alert), ingredient.unit as MeasurementUnit)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-none sm:rounded-lg" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {ingredient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {ingredient.categories && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${ingredient.categories.color}20`,
                  color: ingredient.categories.color,
                  borderColor: ingredient.categories.color,
                }}
              >
                {ingredient.categories.name}
              </Badge>
            )}
            {!ingredient.is_active && (
              <Badge variant="secondary" className="text-xs">Inativo</Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" />
                Estoque baixo
              </Badge>
            )}
          </div>

          {/* Price & Cost */}
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Preço de compra</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(Number(ingredient.purchase_price))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Quantidade</span>
              <span className="text-foreground">
                {formatNumber(Number(ingredient.package_quantity), 3)} {ingredient.unit}
              </span>
            </div>
            <div className="border-t border-accent/20 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Custo por unidade</span>
              <span className="font-bold text-primary">{costInfo.formatted}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {ingredient.brand && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Marca</p>
                <p className="text-sm text-foreground">{ingredient.brand}</p>
              </div>
            )}
            {ingredient.supplier && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="text-sm text-foreground">{ingredient.supplier}</p>
              </div>
            )}
            {stockDisplay && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estoque atual</p>
                <p className={`text-sm ${isLowStock ? 'text-destructive font-medium' : 'text-foreground'}`}>
                  {formatNumber(stockDisplay.displayValue, 3)} {stockDisplay.displayUnit}
                </p>
              </div>
            )}
            {alertDisplay && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Alerta mínimo</p>
                <p className="text-sm text-foreground">
                  {formatNumber(alertDisplay.displayValue, 3)} {alertDisplay.displayUnit}
                </p>
              </div>
            )}
            {expiryDate && (
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground">Validade</p>
                <p className={`text-sm flex items-center gap-1 ${isExpired ? 'text-destructive font-medium' : isExpiringSoon ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-foreground'}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  {isExpired
                    ? `Vencido em ${format(expiryDate, "dd/MM/yyyy", { locale: ptBR })}`
                    : isExpiringSoon
                      ? `Vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}`
                      : format(expiryDate, "dd/MM/yyyy", { locale: ptBR })
                  }
                </p>
              </div>
            )}
          </div>

          {/* Price History */}
          <div className="border border-border rounded-lg p-4">
            <PriceHistoryChart
              ingredientId={ingredient.id}
              ingredientName={ingredient.name}
              currentPrice={Number(ingredient.purchase_price)}
              packageQuantity={Number(ingredient.package_quantity)}
              unit={ingredient.unit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
