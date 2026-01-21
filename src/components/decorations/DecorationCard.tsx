import { type Decoration } from '@/hooks/useDecorations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, getCostPerUnit } from '@/lib/unit-conversion';
import { MoreVertical, Edit, Trash2, Sparkles } from 'lucide-react';

interface DecorationCardProps {
  decoration: Decoration;
  onEdit: (decoration: Decoration) => void;
  onDelete: (decoration: Decoration) => void;
}

export function DecorationCard({ decoration, onEdit, onDelete }: DecorationCardProps) {
  const costInfo = getCostPerUnit(
    Number(decoration.purchase_price),
    Number(decoration.package_quantity),
    decoration.unit
  );

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ 
                backgroundColor: decoration.decoration_categories?.color || 'hsl(var(--muted))' 
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{decoration.name}</h3>
              {decoration.decoration_categories && (
                <Badge 
                  variant="secondary" 
                  className="mt-1"
                  style={{ 
                    backgroundColor: `${decoration.decoration_categories.color}20`,
                    color: decoration.decoration_categories.color 
                  }}
                >
                  {decoration.decoration_categories.name}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(decoration)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(decoration)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Preço de compra</span>
            <span className="font-medium">
              {formatCurrency(Number(decoration.purchase_price))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Quantidade</span>
            <span>{decoration.package_quantity} {decoration.unit}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
            <span className="text-muted-foreground">Custo unitário</span>
            <span className="font-semibold text-accent">{costInfo.formatted}</span>
          </div>
        </div>

        {decoration.brand && (
          <div className="mt-2 text-xs text-muted-foreground">
            Marca: {decoration.brand}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
