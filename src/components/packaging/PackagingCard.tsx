import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Package, Ruler } from 'lucide-react';
import { formatCurrency } from '@/lib/unit-conversion';

interface PackagingCardProps {
  packaging: {
    id: string;
    name: string;
    purchase_price: number;
    package_quantity: number;
    unit: string;
    brand: string | null;
    supplier: string | null;
    dimensions: string | null;
    stock_quantity: number | null;
    min_stock_alert: number | null;
    cost_per_unit: number | null;
    category?: {
      id: string;
      name: string;
      color: string | null;
    } | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function PackagingCard({ packaging, onEdit, onDelete }: PackagingCardProps) {
  const isLowStock = packaging.stock_quantity !== null && 
    packaging.min_stock_alert !== null && 
    packaging.stock_quantity <= packaging.min_stock_alert;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {packaging.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${packaging.category.color}20`,
                    color: packaging.category.color || undefined,
                    borderColor: packaging.category.color || undefined,
                  }}
                >
                  {packaging.category.name}
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Estoque baixo
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg truncate">{packaging.name}</CardTitle>
            {(packaging.brand || packaging.supplier) && (
              <p className="text-sm text-muted-foreground truncate">
                {[packaging.brand, packaging.supplier].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
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
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Preço de compra</p>
            <p className="font-medium">{formatCurrency(packaging.purchase_price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quantidade</p>
            <p className="font-medium">{packaging.package_quantity} {packaging.unit}</p>
          </div>
        </div>
        
        {packaging.dimensions && (
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dimensões:</span>
            <span className="font-medium">{packaging.dimensions}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Custo unitário</span>
            </div>
            <span className="font-semibold text-primary">
              {formatCurrency(packaging.cost_per_unit || 0)}/{packaging.unit}
            </span>
          </div>
        </div>

        {packaging.stock_quantity !== null && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Estoque atual</span>
            <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
              {packaging.stock_quantity} {packaging.unit}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
