import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, Clock, TrendingUp, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  productionCost: number;
  sellingPrice: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onDuplicate: () => void;
}

export function ProductCard({ 
  product, 
  productionCost, 
  sellingPrice, 
  onEdit, 
  onDelete, 
  onView,
  onDuplicate 
}: ProductCardProps) {
  const recipesCount = product.product_recipes?.length || 0;
  const ingredientsCount = product.product_ingredients?.length || 0;
  const decorationsCount = product.product_decorations?.length || 0;
  const packagingCount = product.product_packaging?.length || 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {product.category && (
              <Badge 
                variant="secondary" 
                className="text-xs max-w-[200px] truncate"
                style={{ 
                  backgroundColor: `${product.category.color}20`,
                  color: product.category.color || undefined,
                  borderColor: product.category.color || undefined,
                }}
              >
                {product.category.name}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8" title="Ver detalhes">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8" title="Duplicar">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8" title="Excluir">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Components summary */}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {recipesCount > 0 && (
          <Badge variant="outline">{recipesCount} receita{recipesCount > 1 ? 's' : ''}</Badge>
        )}
        {ingredientsCount > 0 && (
          <Badge variant="outline">{ingredientsCount} ingrediente{ingredientsCount > 1 ? 's' : ''}</Badge>
        )}
        {decorationsCount > 0 && (
          <Badge variant="outline">{decorationsCount} decoração{decorationsCount > 1 ? 'ões' : ''}</Badge>
        )}
        {packagingCount > 0 && (
          <Badge variant="outline">{packagingCount} embalagem{packagingCount > 1 ? 'ns' : ''}</Badge>
        )}
      </div>

      {/* Time and margin */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        {product.decoration_time_minutes && product.decoration_time_minutes > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{product.decoration_time_minutes}min decoração</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span>{product.profit_margin_percent || 30}% margem</span>
        </div>
      </div>

      {/* Costs */}
      <div className="pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Custo de Produção</span>
          <span className="font-medium text-foreground">{formatCurrency(productionCost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Preço de Venda Sugerido</span>
          <span className="font-bold text-primary text-base sm:text-lg">
            {formatCurrency(sellingPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
