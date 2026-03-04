import { useState, useMemo } from 'react';
import { useFinancial } from '@/hooks/useFinancial';
import { useOrders } from '@/hooks/useOrders';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { startOfMonth, endOfMonth, parseISO, format, subMonths, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function RevenueReport() {
  const { transactions, isLoading: loadingTx } = useFinancial();
  const { orders, isLoading: loadingOrders } = useOrders();
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(parseISO(monthFilter + '-01'));
  const monthEnd = endOfMonth(monthStart);

  // Orders in period (exclude cancelled)
  const periodOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const d = o.delivery_date ? new Date(o.delivery_date) : new Date(o.created_at);
      return d >= monthStart && d <= monthEnd;
    });
  }, [orders, monthStart, monthEnd]);

  // Revenue from all non-cancelled, non-quote orders
  const revenue = useMemo(() => {
    return periodOrders
      .filter(o => o.status !== 'quote')
      .reduce((s, o) => s + o.paid_amount, 0);
  }, [periodOrders]);

  const expenses = useMemo(() => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = parseISO(t.date);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, monthStart, monthEnd]);

  // Gross profit from snapshots (cost_at_sale / profit_at_sale)
  const grossProfitData = useMemo(() => {
    let snapshotProfit = 0;
    let snapshotCost = 0;
    let snapshotRevenue = 0;
    let estimatedRevenue = 0;
    let hasEstimated = false;
    let orderCount = 0;

    periodOrders.forEach((o) => {
      if (o.status === 'quote') return; // Exclude quotes from profit
      orderCount++;
      o.order_items?.forEach((item) => {
        const itemRevenue = item.total_price;
        if (item.cost_at_sale != null) {
          const itemCost = item.cost_at_sale * item.quantity;
          const itemProfit = item.profit_at_sale != null
            ? item.profit_at_sale * item.quantity
            : itemRevenue - itemCost;
          snapshotCost += itemCost;
          snapshotProfit += itemProfit;
          snapshotRevenue += itemRevenue;
        } else {
          hasEstimated = true;
          estimatedRevenue += itemRevenue;
        }
      });
    });

    return { snapshotProfit, snapshotCost, snapshotRevenue, estimatedRevenue, hasEstimated, orderCount };
  }, [periodOrders]);

  const profit = revenue - expenses;

  // Top products (use snapshot names)
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number; cost: number; hasSnapshot: boolean }>();
    periodOrders.forEach((o) => {
      if (o.status === 'quote') return;
      o.order_items?.forEach((item) => {
        const name = item.product_name || item.product?.name || 'Produto';
        const existing = map.get(name) || { name, qty: 0, total: 0, cost: 0, hasSnapshot: true };
        existing.qty += item.quantity;
        existing.total += item.total_price;
        if (item.cost_at_sale != null) {
          existing.cost += item.cost_at_sale * item.quantity;
        } else {
          existing.hasSnapshot = false;
        }
        map.set(name, existing);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [periodOrders]);

  // Top clients (use snapshot names)
  const topClients = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    periodOrders.forEach((o) => {
      if (o.status === 'quote') return;
      const name = o.client?.name || o.client_name || 'Cliente';
      const existing = map.get(name) || { name, total: 0, count: 0 };
      existing.total += o.total_amount;
      existing.count += 1;
      map.set(name, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [periodOrders]);

  // Chart data (last 6 months)
  const chartData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(monthStart, 5), end: monthStart });
    return months.map((m) => {
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const income = orders
        .filter((o) => {
          if (o.status === 'cancelled' || o.status === 'quote') return false;
          const d = o.delivery_date ? new Date(o.delivery_date) : new Date(o.created_at);
          return d >= mStart && d <= mEnd;
        })
        .reduce((s, o) => s + o.paid_amount, 0);

      const expense = transactions
        .filter((t) => t.type === 'expense' && parseISO(t.date) >= mStart && parseISO(t.date) <= mEnd)
        .reduce((s, t) => s + t.amount, 0);

      return {
        month: format(m, 'MMM', { locale: ptBR }),
        Receita: income,
        Despesa: expense,
      };
    });
  }, [orders, transactions, monthStart]);

  if (loadingTx || loadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Visão geral do faturamento</p>
        </div>
        <Input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full sm:w-[180px] min-h-[44px]"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Faturamento
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(revenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {grossProfitData.orderCount} pedido{grossProfitData.orderCount !== 1 ? 's' : ''} (exclui orçamentos)
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Despesas
          </div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(expenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Lucro Líquido
          </div>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(profit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Faturamento − Despesas</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Lucro Bruto de Vendas
          </div>
          <p className={`text-xl font-bold ${grossProfitData.snapshotProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(grossProfitData.snapshotProfit)}
          </p>
          {grossProfitData.hasEstimated && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-500">
                Alguns itens sem custo registrado ({formatCurrency(grossProfitData.estimatedRevenue)} em receita)
              </span>
            </div>
          )}
          {!grossProfitData.hasEstimated && grossProfitData.snapshotRevenue > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Baseado em custos congelados</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Últimos 6 meses</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="Receita" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top products + clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Top 5 Produtos</h3>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate flex-1">
                    {p.name} <span className="text-muted-foreground">({p.qty}x)</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium">{formatCurrency(p.total)}</span>
                    {p.hasSnapshot && p.cost > 0 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        Lucro {formatCurrency(p.total - p.cost)}
                      </Badge>
                    )}
                    {!p.hasSnapshot && (
                      <Badge variant="secondary" className="text-xs font-normal text-amber-600">
                        Estimado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum produto no período</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Top 5 Clientes</h3>
          </div>
          {topClients.length > 0 ? (
            <div className="space-y-2">
              {topClients.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{c.name} <span className="text-muted-foreground">({c.count} pedido{c.count !== 1 ? 's' : ''})</span></span>
                  <span className="font-medium ml-2">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum cliente no período</p>
          )}
        </div>
      </div>
    </div>
  );
}
