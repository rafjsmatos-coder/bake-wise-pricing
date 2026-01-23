import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Wrench } from 'lucide-react';
import { formatCurrency } from '@/lib/unit-conversion';

interface ProductionMaterialCardProps {
  material: {
    id: string;
    name: string;
    purchase_price: number;
    package_quantity: number;
    unit: string;
    brand: string | null;
    supplier: string | null;
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

export function ProductionMaterialCard({ material, onEdit, onDelete }: ProductionMaterialCardProps) {
  const isLowStock = material.stock_quantity !== null && 
    material.min_stock_alert !== null && 
    material.stock_quantity <= material.min_stock_alert;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {material.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${material.category.color}20`,
                    color: material.category.color || undefined,
                    borderColor: material.category.color || undefined,
                  }}
                >
                  {material.category.name}
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Estoque baixo
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg truncate">{material.name}</CardTitle>
            {(material.brand || material.supplier) && (
              <p className="text-sm text-muted-foreground truncate">
                {[material.brand, material.supplier].filter(Boolean).join(' • ')}
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
            <p className="font-medium">{formatCurrency(material.purchase_price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quantidade</p>
            <p className="font-medium">{material.package_quantity} {material.unit}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Custo unitário</span>
            </div>
            <span className="font-semibold text-primary">
              {formatCurrency(material.cost_per_unit || 0)}/{material.unit}
            </span>
          </div>
        </div>

        {material.stock_quantity !== null && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Estoque atual</span>
            <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
              {material.stock_quantity} {material.unit}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
