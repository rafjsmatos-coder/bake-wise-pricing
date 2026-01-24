import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  productionCost: number;
  sellingPrice: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function ProductCard({ 
  product, 
  productionCost, 
  sellingPrice, 
  onEdit, 
  onDelete, 
  onView 
}: ProductCardProps) {
  const recipesCount = product.product_recipes?.length || 0;
  const ingredientsCount = product.product_ingredients?.length || 0;
  const decorationsCount = product.product_decorations?.length || 0;
  const packagingCount = product.product_packaging?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {product.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs max-w-[100px] truncate"
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
            <CardTitle className="text-lg truncate">{product.name}</CardTitle>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Components summary */}
        <div className="flex flex-wrap gap-2 text-xs">
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Custo de Produção</span>
            <span className="font-medium">{formatCurrency(productionCost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Preço de Venda Sugerido</span>
            <span className="font-bold text-primary text-lg">
              {formatCurrency(sellingPrice)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
