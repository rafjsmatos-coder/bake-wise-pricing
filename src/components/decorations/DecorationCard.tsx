import { type Decoration } from '@/hooks/useDecorations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, getCostPerUnit } from '@/lib/unit-conversion';
import { Eye, Copy, Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface DecorationCardProps {
  decoration: Decoration;
  onView: (decoration: Decoration) => void;
  onDuplicate: (decoration: Decoration) => void;
  onEdit: (decoration: Decoration) => void;
  onDelete: (decoration: Decoration) => void;
}

export function DecorationCard({ decoration, onView, onDuplicate, onEdit, onDelete }: DecorationCardProps) {
  const costInfo = getCostPerUnit(
    Number(decoration.purchase_price),
    Number(decoration.package_quantity),
    decoration.unit
  );

  const isLowStock = decoration.min_stock_alert && 
    decoration.stock_quantity !== null && 
    Number(decoration.stock_quantity) <= Number(decoration.min_stock_alert);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {decoration.decoration_categories && (
            <Badge
              variant="secondary"
              className="text-xs max-w-[200px] truncate mb-1"
              style={{
                backgroundColor: `${decoration.decoration_categories.color}20`,
                color: decoration.decoration_categories.color,
                borderColor: decoration.decoration_categories.color,
              }}
            >
              {decoration.decoration_categories.name}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {decoration.name}
            </h3>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onView(decoration)} className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDuplicate(decoration)} className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(decoration)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(decoration)} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-muted-foreground mb-3">
        <p>
          <span className="font-medium text-foreground">
            {formatCurrency(Number(decoration.purchase_price))}
          </span>
          {' / '}
          {decoration.package_quantity} {decoration.unit}
        </p>

        {decoration.brand && (
          <p>Marca: {decoration.brand}</p>
        )}

        {decoration.supplier && (
          <p>Fornecedor: {decoration.supplier}</p>
        )}

        {decoration.stock_quantity !== null && (
          <p className={isLowStock ? 'text-destructive' : ''}>
            Estoque: {decoration.stock_quantity} {decoration.unit}
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
