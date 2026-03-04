import { Order } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Eye, Pencil, Calendar, User, Copy, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/product-cost-calculator';

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDuplicate?: (order: Order) => void;
}

export function OrderCard({ order, onView, onEdit, onDuplicate }: OrderCardProps) {
  const discount = order.discount || 0;
  const effectiveTotal = order.total_amount - discount;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="font-semibold text-foreground truncate">
            {order.client?.name || order.client_name || 'Cliente removido'}
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

      {/* Items summary */}
      <div className="text-sm text-muted-foreground mb-3">
        {order.order_items && order.order_items.length > 0 ? (
          <p className="truncate">
            {order.order_items.map((item) => `${item.quantity}x ${item.product_name || item.product?.name || 'Produto'}`).join(', ')}
          </p>
        ) : (
          <p className="italic">Sem itens</p>
        )}
      </div>

      {/* Status + Payment */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <OrderStatusBadge status={order.status} />
        <OrderStatusBadge status={order.payment_status} type="payment" />
        {discount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            <Tag className="h-3 w-3" />
            -{formatCurrency(discount)}
          </span>
        )}
      </div>

      {/* Footer with total + actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="text-right">
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through mr-2">{formatCurrency(order.total_amount)}</span>
          )}
          <span className="font-bold text-primary">{formatCurrency(effectiveTotal)}</span>
        </div>
        <div className="flex gap-1 shrink-0">
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
        </div>
      </div>
    </div>
  );
}
