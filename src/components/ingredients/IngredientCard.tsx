import { Ingredient } from '@/hooks/useIngredients';
import { formatCurrency, formatNumber, getCostPerUnit } from '@/lib/unit-conversion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  const costInfo = getCostPerUnit(
    Number(ingredient.purchase_price),
    Number(ingredient.package_quantity),
    ingredient.unit
  );

  const isLowStock = ingredient.min_stock_alert && 
    ingredient.stock_quantity !== null && 
    Number(ingredient.stock_quantity) <= Number(ingredient.min_stock_alert);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
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
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(ingredient)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(ingredient)} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
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

        {ingredient.stock_quantity !== null && (
          <p className={isLowStock ? 'text-destructive' : ''}>
            Estoque: {formatNumber(Number(ingredient.stock_quantity), 3)} {ingredient.unit}
          </p>
        )}
      </div>

      {/* Cost */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Custo unitário</span>
          <span className="font-bold text-primary">{costInfo.formatted}</span>
        </div>
      </div>
    </div>
  );
}
