import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCostBreakdown } from './ProductCostBreakdown';
import { calculateProductCost } from '@/lib/product-cost-calculator';
import type { Product } from '@/hooks/useProducts';
import { BookOpen, Package, Sparkles, Box, Clock, FileText } from 'lucide-react';

interface ProductDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  recipeCosts: Record<string, number>;
  laborCostPerHour: number;
}

export function ProductDetails({ 
  open, 
  onOpenChange, 
  product, 
  recipeCosts, 
  laborCostPerHour 
}: ProductDetailsProps) {
  if (!product) return null;

  const breakdown = calculateProductCost({
    product,
    recipeCosts,
    laborCostPerHour,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {product.category && (
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: `${product.category.color}20`,
                  color: product.category.color || undefined,
                }}
              >
                {product.category.name}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipes */}
          {product.product_recipes && product.product_recipes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Receitas</h3>
              </div>
              <div className="space-y-1">
                {product.product_recipes.map((pr) => (
                  <div key={pr.id} className="flex justify-between text-sm">
                    <span>{pr.recipe?.name}</span>
                    <span className="text-muted-foreground">{pr.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {product.product_ingredients && product.product_ingredients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Ingredientes Avulsos</h3>
              </div>
              <div className="space-y-1">
                {product.product_ingredients.map((pi) => (
                  <div key={pi.id} className="flex justify-between text-sm">
                    <span>{pi.ingredient?.name}</span>
                    <span className="text-muted-foreground">{pi.quantity} {pi.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decorations */}
          {product.product_decorations && product.product_decorations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Decorações</h3>
              </div>
              <div className="space-y-1">
                {product.product_decorations.map((pd) => (
                  <div key={pd.id} className="flex justify-between text-sm">
                    <span>{pd.decoration?.name}</span>
                    <span className="text-muted-foreground">{pd.quantity} {pd.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packaging */}
          {product.product_packaging && product.product_packaging.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Box className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Embalagens</h3>
              </div>
              <div className="space-y-1">
                {product.product_packaging.map((pp) => (
                  <div key={pp.id} className="flex justify-between text-sm">
                    <span>{pp.packaging?.name}</span>
                    <span className="text-muted-foreground">{pp.quantity} un</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decoration time */}
          {product.decoration_time_minutes && product.decoration_time_minutes > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Tempo de decoração: {product.decoration_time_minutes} minutos</span>
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Observações</h3>
              </div>
              <p className="text-sm text-muted-foreground">{product.notes}</p>
            </div>
          )}

          <Separator />

          {/* Cost breakdown */}
          <ProductCostBreakdown breakdown={breakdown} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
