import { useState, useMemo } from 'react';
import { useFinancial } from '@/hooks/useFinancial';
import { useOrders } from '@/hooks/useOrders';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, Target, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { startOfMonth, endOfMonth, parseISO, format, subMonths, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = [
  'hsl(142 71% 45%)', 'hsl(217 91% 60%)', 'hsl(280 65% 60%)',
  'hsl(25 95% 53%)', 'hsl(340 82% 52%)', 'hsl(47 96% 53%)',
  'hsl(173 80% 40%)', 'hsl(0 72% 51%)', 'hsl(221 83% 53%)',
];

export function RevenueReport() {
  const { transactions, isLoading: loadingTx } = useFinancial();
  const { orders, isLoading: loadingOrders } = useOrders();
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(parseISO(monthFilter + '-01'));
  const monthEnd = endOfMonth(monthStart);

  // Previous month for comparison
  const prevMonthStart = startOfMonth(subMonths(monthStart, 1));
  const prevMonthEnd = endOfMonth(prevMonthStart);

  // Orders in period (exclude cancelled)
  const periodOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const d = o.delivery_date ? new Date(o.delivery_date) : new Date(o.created_at);
      return d >= monthStart && d <= monthEnd;
    });
  }, [orders, monthStart, monthEnd]);

  // Previous month orders
  const prevPeriodOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const d = o.delivery_date ? new Date(o.delivery_date) : new Date(o.created_at);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });
  }, [orders, prevMonthStart, prevMonthEnd]);

  // Revenue from all non-cancelled, non-quote orders
  const revenue = useMemo(() => {
    return periodOrders
      .filter(o => o.status !== 'quote')
      .reduce((s, o) => s + o.paid_amount, 0);
  }, [periodOrders]);

  const prevRevenue = useMemo(() => {
    return prevPeriodOrders
      .filter(o => o.status !== 'quote')
      .reduce((s, o) => s + o.paid_amount, 0);
  }, [prevPeriodOrders]);

  const expenses = useMemo(() => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = parseISO(t.date);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, monthStart, monthEnd]);

  const prevExpenses = useMemo(() => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = parseISO(t.date);
        return d >= prevMonthStart && d <= prevMonthEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, prevMonthStart, prevMonthEnd]);

  // Gross profit from snapshots
  const grossProfitData = useMemo(() => {
    let snapshotProfit = 0;
    let snapshotCost = 0;
    let snapshotRevenue = 0;
    let estimatedRevenue = 0;
    let hasEstimated = false;
    let orderCount = 0;

    periodOrders.forEach((o) => {
      if (o.status === 'quote') return;
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
  const prevProfit = prevRevenue - prevExpenses;

  // Ticket médio
  const confirmedOrders = periodOrders.filter(o => o.status !== 'quote');
  const avgTicket = confirmedOrders.length > 0 ? revenue / confirmedOrders.length : 0;
  const prevConfirmedOrders = prevPeriodOrders.filter(o => o.status !== 'quote');
  const prevAvgTicket = prevConfirmedOrders.length > 0 ? prevRevenue / prevConfirmedOrders.length : 0;

  // Conversão orçamento → pedido
  const conversionData = useMemo(() => {
    const quotes = periodOrders.filter(o => o.status === 'quote');
    const confirmed = periodOrders.filter(o => o.status !== 'quote');
    // Also count orders that were originally quotes (now confirmed) - approximate by total
    const totalQuotesAndConfirmed = quotes.length + confirmed.length;
    const conversionRate = totalQuotesAndConfirmed > 0 ? (confirmed.length / totalQuotesAndConfirmed) * 100 : 0;
    return { quotes: quotes.length, confirmed: confirmed.length, rate: conversionRate };
  }, [periodOrders]);

  // Margem de lucro por produto
  const productMargins = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; cost: number; qty: number; hasSnapshot: boolean }>();
    periodOrders.forEach((o) => {
      if (o.status === 'quote') return;
      o.order_items?.forEach((item) => {
        const name = item.product_name || item.product?.name || 'Produto';
        const existing = map.get(name) || { name, revenue: 0, cost: 0, qty: 0, hasSnapshot: true };
        existing.qty += item.quantity;
        existing.revenue += item.total_price;
        if (item.cost_at_sale != null) {
          existing.cost += item.cost_at_sale * item.quantity;
        } else {
          existing.hasSnapshot = false;
        }
        map.set(name, existing);
      });
    });
    return Array.from(map.values())
      .filter(p => p.hasSnapshot && p.cost > 0)
      .map(p => ({
        ...p,
        profit: p.revenue - p.cost,
        margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [periodOrders]);

  // Pie chart: receita por categoria de produto (usando product_name grouping)
  const categoryRevenue = useMemo(() => {
    const map = new Map<string, number>();
    periodOrders.forEach((o) => {
      if (o.status === 'quote') return;
      o.order_items?.forEach((item) => {
        const name = item.product_name || item.product?.name || 'Outros';
        map.set(name, (map.get(name) || 0) + item.total_price);
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [periodOrders]);

  // Top clients
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

  // Helper: variation percentage
  function variationPercent(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null;
    return ((current - previous) / previous) * 100;
  }

  function VariationBadge({ current, previous }: { current: number; previous: number }) {
    const pct = variationPercent(current, previous);
    if (pct === null) return null;
    const isPositive = pct >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(pct).toFixed(1)}%
      </span>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Como vai seu negócio</h1>
          <p className="text-muted-foreground">Resumo do que entrou e saiu no período</p>
        </div>
        <Input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full sm:w-[180px] min-h-[44px]"
        />
      </div>

      {/* Summary cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Faturamento
            </div>
            <VariationBadge current={revenue} previous={prevRevenue} />
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(revenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {grossProfitData.orderCount} pedido{grossProfitData.orderCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Despesas
            </div>
            <VariationBadge current={expenses} previous={prevExpenses} />
          </div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(expenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Sobrou no final
            </div>
            <VariationBadge current={profit} previous={prevProfit} />
          </div>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(profit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">O que entrou menos o que saiu</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Ganho com Vendas
          </div>
          <p className="text-xs text-muted-foreground -mt-0.5 mb-1">Quanto você ganhou além do que gastou para produzir</p>
          <p className={`text-xl font-bold ${grossProfitData.snapshotProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(grossProfitData.snapshotProfit)}
          </p>
          {grossProfitData.hasEstimated && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-500">
                Itens sem custo ({formatCurrency(grossProfitData.estimatedRevenue)})
              </span>
            </div>
          )}
          {!grossProfitData.hasEstimated && grossProfitData.snapshotRevenue > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Calculado com base no custo registrado na venda</p>
          )}
        </div>
      </div>

      {/* Summary cards - Row 2: Ticket médio, Conversão, Pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Valor Médio por Pedido
            </div>
            <VariationBadge current={avgTicket} previous={prevAvgTicket} />
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(avgTicket)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Em média, cada pedido rendeu esse valor ({confirmedOrders.length} pedido{confirmedOrders.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            Orçamentos que Viraram Pedido
          </div>
          <p className="text-xs text-muted-foreground -mt-0.5 mb-1">De cada orçamento enviado, quantos foram confirmados</p>
          <p className="text-xl font-bold text-foreground">
            {conversionData.rate.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {conversionData.confirmed} confirmado{conversionData.confirmed !== 1 ? 's' : ''} / {conversionData.quotes} orçamento{conversionData.quotes !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BarChart3 className="h-4 w-4" />
            Lucro Médio por Venda
          </div>
          {productMargins.length > 0 ? (
            <>
              <p className="text-xl font-bold text-foreground">
                {(productMargins.reduce((s, p) => s + p.margin, 0) / productMargins.length).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                De cada venda, esse % ficou de lucro ({productMargins.length} produto{productMargins.length !== 1 ? 's' : ''})
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-muted-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">Sem dados de custo no período</p>
            </>
          )}
        </div>
      </div>

      {/* Charts row: Bar chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Comparativo dos últimos 6 meses</h3>
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

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">O que mais vendeu</h3>
          {categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.length > 12 ? name.slice(0, 12) + '…' : name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryRevenue.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-sm text-muted-foreground">Nenhuma venda no período</p>
            </div>
          )}
        </div>
      </div>

      {/* Margin table */}
      {productMargins.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Quanto você lucrou em cada produto</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Produto</th>
                  <th className="pb-2 pr-4 text-right">Qtd</th>
                   <th className="pb-2 pr-4 text-right">Vendeu</th>
                   <th className="pb-2 pr-4 text-right">Custou</th>
                   <th className="pb-2 pr-4 text-right">Lucrou</th>
                   <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {productMargins.map((p, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 truncate max-w-[150px]">{p.name}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{p.qty}x</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(p.revenue)}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{formatCurrency(p.cost)}</td>
                    <td className="py-2 pr-4 text-right font-medium text-green-600">{formatCurrency(p.profit)}</td>
                    <td className="py-2 text-right">
                      <Badge
                        variant={p.margin >= 50 ? 'default' : p.margin >= 30 ? 'secondary' : 'destructive'}
                        className="text-xs font-normal"
                      >
                        {p.margin.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top products + clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Top 5 Produtos</h3>
          </div>
          {categoryRevenue.length > 0 ? (
            <div className="space-y-2">
              {categoryRevenue.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="font-medium shrink-0">{formatCurrency(p.value)}</span>
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
