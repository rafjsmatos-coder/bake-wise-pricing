import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Ruler, AlertTriangle } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {packaging.category && (
            <Badge
              variant="secondary"
              className="text-xs max-w-[100px] truncate mb-1"
              style={{
                backgroundColor: `${packaging.category.color}20`,
                color: packaging.category.color || undefined,
                borderColor: packaging.category.color || undefined,
              }}
            >
              {packaging.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{packaging.name}</h3>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-muted-foreground mb-3">
        <p>
          <span className="font-medium text-foreground">
            {formatCurrency(packaging.purchase_price)}
          </span>
          {' / '}
          {packaging.package_quantity} {packaging.unit}
        </p>

        {packaging.brand && (
          <p>Marca: {packaging.brand}</p>
        )}

        {packaging.dimensions && (
          <div className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            <span>{packaging.dimensions}</span>
          </div>
        )}

        {packaging.stock_quantity !== null && (
          <p className={isLowStock ? 'text-destructive' : ''}>
            Estoque: {packaging.stock_quantity} {packaging.unit}
          </p>
        )}
      </div>

      {/* Cost */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Custo unitário</span>
          <span className="font-bold text-primary">
            {formatCurrency(packaging.cost_per_unit || 0)}/{packaging.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
