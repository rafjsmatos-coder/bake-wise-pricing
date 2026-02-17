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
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { isPast, differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getBestDisplayUnit, formatNumber, type MeasurementUnit } from '@/lib/unit-conversion';

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

interface ExpiryItem {
  id: string;
  name: string;
  expiryDate: Date;
  isExpired: boolean;
  daysUntil: number;
}

export function StockAlertsCard({ onNavigate }: StockAlertsCardProps) {
  const { ingredients } = useIngredients();
  const { decorations } = useDecorations();
  const { packagingItems } = usePackaging();

  // Collect low stock items
  const lowStockItems: LowStockItem[] = [];

  ingredients.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id, name: item.name, type: 'ingredient',
        stockQuantity: item.stock_quantity, minAlert: item.min_stock_alert, unit: item.unit,
      });
    }
  });

  decorations.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id, name: item.name, type: 'decoration',
        stockQuantity: item.stock_quantity, minAlert: item.min_stock_alert, unit: item.unit,
      });
    }
  });

  packagingItems.forEach((item) => {
    if (
      item.stock_quantity !== null && 
      item.min_stock_alert !== null && 
      item.min_stock_alert > 0 &&
      item.stock_quantity <= item.min_stock_alert
    ) {
      lowStockItems.push({
        id: item.id, name: item.name, type: 'packaging',
        stockQuantity: item.stock_quantity, minAlert: item.min_stock_alert, unit: item.unit,
      });
    }
  });

  // Collect expiry items
  const expiryItems: ExpiryItem[] = [];
  ingredients.forEach((item) => {
    if (item.expiry_date) {
      const expiryDate = parseISO(item.expiry_date);
      const isExpired = isPast(expiryDate);
      const daysUntil = differenceInDays(expiryDate, new Date());
      if (isExpired || daysUntil <= 7) {
        expiryItems.push({
          id: item.id, name: item.name, expiryDate, isExpired, daysUntil,
        });
      }
    }
  });

  // Sort: expired first, then by days until expiry
  expiryItems.sort((a, b) => {
    if (a.isExpired && !b.isExpired) return -1;
    if (!a.isExpired && b.isExpired) return 1;
    return a.daysUntil - b.daysUntil;
  });

  const getTypeIcon = (type: LowStockItem['type']) => {
    switch (type) {
      case 'ingredient': return <Package className="h-4 w-4 text-green-500" />;
      case 'decoration': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'packaging': return <Box className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: LowStockItem['type']) => {
    switch (type) {
      case 'ingredient': return 'Ingrediente';
      case 'decoration': return 'Decoração';
      case 'packaging': return 'Embalagem';
    }
  };

  const hasAlerts = lowStockItems.length > 0 || expiryItems.length > 0;
  const displayStockItems = lowStockItems.slice(0, 5);
  const hasMoreStock = lowStockItems.length > 5;
  const displayExpiryItems = expiryItems.slice(0, 5);
  const hasMoreExpiry = expiryItems.length > 5;

  if (!hasAlerts) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Tudo OK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Estoque adequado e nenhum ingrediente vencendo. Continue assim! 👏
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
          Alertas
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {lowStockItems.length + expiryItems.length} {(lowStockItems.length + expiryItems.length) === 1 ? 'alerta' : 'alertas'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock alerts */}
        {lowStockItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estoque baixo</p>
            {displayStockItems.map((item) => (
              <div 
                key={`stock-${item.type}-${item.id}`}
                className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getTypeIcon(item.type)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(item.type)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {(() => {
                    const stockDisplay = getBestDisplayUnit(item.stockQuantity, item.unit as MeasurementUnit);
                    const alertDisplay = getBestDisplayUnit(item.minAlert, item.unit as MeasurementUnit);
                    return (
                      <>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          {formatNumber(stockDisplay.displayValue, 3)} {stockDisplay.displayUnit}
                        </p>
                        <p className="text-xs text-muted-foreground">Mín: {formatNumber(alertDisplay.displayValue, 3)} {alertDisplay.displayUnit}</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
            {hasMoreStock && (
              <p className="text-xs text-center text-muted-foreground">
                E mais {lowStockItems.length - 5} itens com estoque baixo...
              </p>
            )}
          </div>
        )}

        {/* Expiry alerts */}
        {expiryItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Validade</p>
            {displayExpiryItems.map((item) => (
              <div 
                key={`expiry-${item.id}`}
                className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className={`h-4 w-4 ${item.isExpired ? 'text-destructive' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Ingrediente</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {item.isExpired ? (
                    <p className="text-sm font-semibold text-destructive">Vencido</p>
                  ) : (
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {item.daysUntil} dia{item.daysUntil !== 1 ? 's' : ''}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(item.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
            {hasMoreExpiry && (
              <p className="text-xs text-center text-muted-foreground">
                E mais {expiryItems.length - 5} ingredientes vencendo...
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(lowStockItems.some(i => i.type === 'ingredient') || expiryItems.length > 0) && (
            <Button variant="outline" size="sm" className="min-h-[44px] text-xs" onClick={() => onNavigate('ingredients')}>
              <Package className="h-4 w-4 mr-1" /> Ingredientes
            </Button>
          )}
          {lowStockItems.some(i => i.type === 'decoration') && (
            <Button variant="outline" size="sm" className="min-h-[44px] text-xs" onClick={() => onNavigate('decorations')}>
              <Sparkles className="h-4 w-4 mr-1" /> Decorações
            </Button>
          )}
          {lowStockItems.some(i => i.type === 'packaging') && (
            <Button variant="outline" size="sm" className="min-h-[44px] text-xs" onClick={() => onNavigate('packaging')}>
              <Box className="h-4 w-4 mr-1" /> Embalagens
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
