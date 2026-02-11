import { Order } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Eye, Pencil, Trash2, Calendar, User, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/product-cost-calculator';

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onDuplicate?: (order: Order) => void;
}

export function OrderCard({ order, onView, onEdit, onDelete, onDuplicate }: OrderCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold text-foreground truncate">
              {order.client?.name || 'Cliente removido'}
            </h3>
          </div>
          {order.delivery_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
          <Button variant="ghost" size="icon" onClick={() => onView(order)} className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          {onDuplicate && (
            <Button variant="ghost" size="icon" onClick={() => onDuplicate(order)} className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(order)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(order)} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Items summary */}
      <div className="text-sm text-muted-foreground mb-3">
        {order.order_items && order.order_items.length > 0 ? (
          <p className="truncate">
            {order.order_items.map((item) => `${item.quantity}x ${item.product?.name || 'Produto'}`).join(', ')}
          </p>
        ) : (
          <p className="italic">Sem itens</p>
        )}
      </div>

      {/* Status + Payment */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <OrderStatusBadge status={order.status} />
        <OrderStatusBadge status={order.payment_status} type="payment" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-bold text-primary">{formatCurrency(order.total_amount)}</span>
      </div>
    </div>
  );
}
