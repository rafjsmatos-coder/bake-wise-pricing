import { useIngredients } from '@/hooks/useIngredients';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Package, 
  Sparkles, 
  Box,
  CheckCircle2
} from 'lucide-react';

interface StockAlertsCardProps {
  onNavigate: (page: string) => void;
}

interface LowStockItem {
  id: string;
  name: string;
  type: 'ingredient' | 'decoration' | 'packaging';
  stockQuantity: number;
  minAlert: number;
  unit: string;
}

export function StockAlertsCard({ onNavigate }: StockAlertsCardProps) {
  const { ingredients } = useIngredients();
  const { decorations } = useDecorations();
  const { packagingItems } = usePackaging();

  // Collect all low stock items
  const lowStockItems: LowStockItem[] = [];

  // Check ingredients
  ingredients.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id,
        name: item.name,
        type: 'ingredient',
        stockQuantity: item.stock_quantity,
        minAlert: item.min_stock_alert,
        unit: item.unit,
      });
    }
  });

  // Check decorations
  decorations.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id,
        name: item.name,
        type: 'decoration',
        stockQuantity: item.stock_quantity,
        minAlert: item.min_stock_alert,
        unit: item.unit,
      });
    }
  });

  // Check packaging
  packagingItems.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id,
        name: item.name,
        type: 'packaging',
        stockQuantity: item.stock_quantity,
        minAlert: item.min_stock_alert,
        unit: item.unit,
      });
    }
  });

  const getTypeIcon = (type: LowStockItem['type']) => {
    switch (type) {
      case 'ingredient':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'decoration':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'packaging':
        return <Box className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: LowStockItem['type']) => {
    switch (type) {
      case 'ingredient':
        return 'Ingrediente';
      case 'decoration':
        return 'Decoração';
      case 'packaging':
        return 'Embalagem';
    }
  };

  const getNavigatePage = (type: LowStockItem['type']) => {
    switch (type) {
      case 'ingredient':
        return 'ingredients';
      case 'decoration':
        return 'decorations';
      case 'packaging':
        return 'packaging';
    }
  };

  // Show max 5 items
  const displayItems = lowStockItems.slice(0, 5);
  const hasMore = lowStockItems.length > 5;

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Estoque OK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Todos os itens estão com estoque adequado. Continue assim! 👏
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertas de Estoque
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'itens'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayItems.map((item) => (
          <div 
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getTypeIcon(item.type)}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getTypeLabel(item.type)}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {item.stockQuantity} {item.unit}
              </p>
              <p className="text-xs text-muted-foreground">
                Mín: {item.minAlert} {item.unit}
              </p>
            </div>
          </div>
        ))}

        {hasMore && (
          <p className="text-xs text-center text-muted-foreground">
            E mais {lowStockItems.length - 5} itens com estoque baixo...
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {lowStockItems.some(i => i.type === 'ingredient') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] text-xs"
              onClick={() => onNavigate('ingredients')}
            >
              <Package className="h-4 w-4 mr-1" />
              Ingredientes
            </Button>
          )}
          {lowStockItems.some(i => i.type === 'decoration') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] text-xs"
              onClick={() => onNavigate('decorations')}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Decorações
            </Button>
          )}
          {lowStockItems.some(i => i.type === 'packaging') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] text-xs"
              onClick={() => onNavigate('packaging')}
            >
              <Box className="h-4 w-4 mr-1" />
              Embalagens
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
