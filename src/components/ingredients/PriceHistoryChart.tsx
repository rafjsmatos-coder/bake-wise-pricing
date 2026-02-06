import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/unit-conversion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

interface PriceHistoryChartProps {
  ingredientId: string;
  ingredientName: string;
  currentPrice: number;
  packageQuantity: number;
  unit: string;
}

interface PriceHistoryEntry {
  id: string;
  ingredient_id: string;
  price: number;
  package_quantity: number;
  recorded_at: string;
}

export function PriceHistoryChart({ 
  ingredientId, 
  ingredientName,
  currentPrice,
  packageQuantity,
  unit 
}: PriceHistoryChartProps) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['price-history', ingredientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_price_history')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data as PriceHistoryEntry[];
    },
  });

  const chartData = useMemo(() => {
    // Include current price as the latest point
    const entries = [
      ...history.map(h => ({
        date: format(new Date(h.recorded_at), 'dd/MM', { locale: ptBR }),
        fullDate: format(new Date(h.recorded_at), 'dd/MM/yyyy', { locale: ptBR }),
        price: Number(h.price),
        costPerUnit: Number(h.price) / Number(h.package_quantity),
      })),
      {
        date: 'Atual',
        fullDate: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
        price: currentPrice,
        costPerUnit: currentPrice / packageQuantity,
      }
    ];
    
    return entries;
  }, [history, currentPrice, packageQuantity]);

  const priceChange = useMemo(() => {
    if (history.length === 0) return { value: 0, percent: 0, trend: 'neutral' as const };
    
    const firstPrice = Number(history[0].price);
    const change = currentPrice - firstPrice;
    const percentChange = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
    
    return {
      value: change,
      percent: percentChange,
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
    };
  }, [history, currentPrice]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Nenhum histórico de preços ainda.</p>
        <p className="text-xs mt-1">O histórico será criado quando você atualizar o preço do ingrediente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Variação desde o primeiro registro</p>
          <div className="flex items-center gap-2 mt-1">
            {priceChange.trend === 'up' && (
              <TrendingUp className="h-4 w-4 text-destructive" />
            )}
            {priceChange.trend === 'down' && (
              <TrendingDown className="h-4 w-4 text-accent" />
            )}
            {priceChange.trend === 'neutral' && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={
              priceChange.trend === 'up' 
                ? 'text-destructive font-medium' 
                : priceChange.trend === 'down'
                  ? 'text-accent font-medium'
                  : 'text-muted-foreground'
            }>
              {priceChange.value > 0 ? '+' : ''}{formatCurrency(priceChange.value)} ({priceChange.percent.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Preço atual</p>
          <p className="font-bold text-foreground">{formatCurrency(currentPrice)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `R$${value.toFixed(0)}`}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium">{data.fullDate}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Preço: <span className="font-medium text-foreground">{formatCurrency(data.price)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custo/{unit}: {formatCurrency(data.costPerUnit)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {history.length} alteração{history.length !== 1 ? 'ões' : ''} de preço registrada{history.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
