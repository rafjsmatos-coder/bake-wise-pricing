import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, DollarSign, Search, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReceivablesList() {
  const { orders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');

  const receivables = useMemo(() => {
    let filtered = orders.filter((o) => {
      const effectiveTotal = o.total_amount - (o.discount || 0);
      return o.status !== 'cancelled' && o.paid_amount < effectiveTotal;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => o.client?.name?.toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => {
        const aOverdue = a.status === 'delivered' ? 0 : 1;
        const bOverdue = b.status === 'delivered' ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        const aDate = a.delivery_date ? new Date(a.delivery_date).getTime() : Infinity;
        const bDate = b.delivery_date ? new Date(b.delivery_date).getTime() : Infinity;
        return aDate - bDate;
      });
  }, [orders, searchQuery]);

  const totalReceivable = useMemo(
    () => receivables.reduce((s, o) => s + (o.total_amount - (o.discount || 0) - o.paid_amount), 0),
    [receivables]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">Quem ainda deve</h1>
        <p className="text-muted-foreground">
          {receivables.length} pedido{receivables.length !== 1 ? 's' : ''} com pagamento pendente
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <DollarSign className="h-4 w-4" />
          Ainda falta receber
        </div>
        <p className="text-2xl font-bold text-primary">{formatCurrency(totalReceivable)}</p>
      </div>

      {receivables.length > 0 ? (
        <div className="space-y-2">
          {receivables.map((order) => {
            const effectiveTotal = order.total_amount - (order.discount || 0);
            const remaining = effectiveTotal - order.paid_amount;
            const isOverdue = order.status === 'delivered';

            return (
              <div key={order.id} className={`p-4 bg-card border rounded-lg ${isOverdue ? 'border-destructive/50' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                      <span className="font-semibold text-sm truncate">{order.client?.name || order.client_name || 'Cliente'}</span>
                    </div>
                    {order.delivery_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Entrega: {format(new Date(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-destructive">{formatCurrency(remaining)}</p>
                    <p className="text-xs text-muted-foreground">de {formatCurrency(effectiveTotal)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <OrderStatusBadge status={order.status} />
                  <OrderStatusBadge status={order.payment_status} type="payment" />
                  {isOverdue && <span className="text-xs text-destructive font-medium">Entregue - Pagamento pendente</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Tudo em dia! 🎉</h3>
          <p className="text-muted-foreground">Não há pedidos com saldo pendente.</p>
        </div>
      )}
    </div>
  );
}
