import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, Clock, TrendingUp, Copy, RotateCcw } from 'lucide-react';
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
  onReactivate?: () => void;
}

export function ProductCard({ 
  product, 
  productionCost, 
  sellingPrice, 
  onEdit, 
  onDelete, 
  onView,
  onDuplicate,
  onReactivate,
}: ProductCardProps) {
  const recipesCount = product.product_recipes?.length || 0;
  const ingredientsCount = product.product_ingredients?.length || 0;
  const decorationsCount = product.product_decorations?.length || 0;
  const packagingCount = product.product_packaging?.length || 0;
  const isInactive = !product.is_active;

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow overflow-hidden ${isInactive ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
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
          {isInactive && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
        </div>
        <h3 className="font-semibold text-foreground truncate mt-1">{product.name}</h3>
      </div>

      {/* Components summary */}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {recipesCount > 0 && <Badge variant="outline">{recipesCount} receita{recipesCount > 1 ? 's' : ''}</Badge>}
        {ingredientsCount > 0 && <Badge variant="outline">{ingredientsCount} ingrediente{ingredientsCount > 1 ? 's' : ''}</Badge>}
        {decorationsCount > 0 && <Badge variant="outline">{decorationsCount} decoraç{decorationsCount > 1 ? 'ões' : 'ão'}</Badge>}
        {packagingCount > 0 && <Badge variant="outline">{packagingCount} embalage{packagingCount > 1 ? 'ns' : 'm'}</Badge>}
      </div>

      {/* Time and margin */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        {product.decoration_time_minutes && product.decoration_time_minutes > 0 && (
          <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{product.decoration_time_minutes}min decoração</span></div>
        )}
        <div className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /><span>{product.profit_margin_percent || 30}% margem</span></div>
      </div>

      {/* Footer with costs + actions */}
      <div className="pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Custo de Produção</span>
          <span className="font-medium text-foreground">{formatCurrency(productionCost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted-foreground text-sm">Venda: </span>
            <span className="font-bold text-primary text-base sm:text-lg">{formatCurrency(sellingPrice)}</span>
          </div>
          <div className="flex gap-1 shrink-0">
            {isInactive && onReactivate ? (
              <Button variant="outline" size="sm" onClick={onReactivate} className="h-8 gap-1 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reativar
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8" title="Ver detalhes"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8" title="Duplicar"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title="Editar"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8" title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
