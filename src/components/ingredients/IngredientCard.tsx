import { Ingredient } from '@/hooks/useIngredients';
import { formatCurrency, formatNumber, getCostPerUnit } from '@/lib/unit-conversion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react';

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
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {ingredient.name}
            </h3>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
          </div>

          {ingredient.categories && (
            <Badge
              variant="secondary"
              className="mb-2"
              style={{
                backgroundColor: `${ingredient.categories.color}20`,
                color: ingredient.categories.color,
                borderColor: ingredient.categories.color,
              }}
            >
              {ingredient.categories.name}
            </Badge>
          )}

          <div className="space-y-1 text-sm text-muted-foreground">
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
        </div>

        <div className="flex flex-col items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(ingredient)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(ingredient)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Custo/un.</p>
            <p className="font-bold text-accent">{costInfo.formatted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
