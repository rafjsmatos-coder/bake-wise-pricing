import { Ingredient } from '@/hooks/useIngredients';
import { formatCurrency, formatNumber, getCostPerUnit, getBestDisplayUnit, type MeasurementUnit } from '@/lib/unit-conversion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Pencil, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { format, isPast, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IngredientCardProps {
  ingredient: Ingredient;
  onView: (ingredient: Ingredient) => void;
  onDuplicate: (ingredient: Ingredient) => void;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

export function IngredientCard({ ingredient, onView, onDuplicate, onEdit, onDelete }: IngredientCardProps) {
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

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-3">
        {ingredient.categories && (
          <Badge
            variant="secondary"
            className="text-xs max-w-[200px] truncate mb-1"
            style={{
              backgroundColor: `${ingredient.categories.color}20`,
              color: ingredient.categories.color,
              borderColor: ingredient.categories.color,
            }}
          >
            {ingredient.categories.name}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">
            {ingredient.name}
          </h3>
          {isLowStock && (
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-muted-foreground mb-3">
        <p>
          <span className="font-medium text-foreground">
            {formatCurrency(Number(ingredient.purchase_price))}
          </span>
          {' / '}
          {formatNumber(Number(ingredient.package_quantity), 3)} {ingredient.unit}
        </p>

        {ingredient.brand && (
          <p>Marca: {ingredient.brand}</p>
        )}

        {ingredient.supplier && (
          <p>Fornecedor: {ingredient.supplier}</p>
        )}

        {ingredient.stock_quantity !== null && (() => {
          const stockDisplay = getBestDisplayUnit(Number(ingredient.stock_quantity), ingredient.unit as MeasurementUnit);
          return (
            <p className={isLowStock ? 'text-destructive' : ''}>
              Estoque: {formatNumber(stockDisplay.displayValue, 3)} {stockDisplay.displayUnit}
            </p>
          );
        })()}

        {expiryDate && (
          <p className={`flex items-center gap-1 ${isExpired ? 'text-destructive font-medium' : isExpiringSoon ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
            <Calendar className="h-3 w-3" />
            {isExpired
              ? `Vencido em ${format(expiryDate, "dd/MM/yyyy", { locale: ptBR })}`
              : isExpiringSoon
                ? `Vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}`
                : `Val: ${format(expiryDate, "dd/MM/yyyy", { locale: ptBR })}`
            }
          </p>
        )}
      </div>

      {/* Footer with cost + actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Custo: </span>
          <span className="font-bold text-primary">{costInfo.formatted}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onView(ingredient)} className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDuplicate(ingredient)} className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(ingredient)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(ingredient)} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
