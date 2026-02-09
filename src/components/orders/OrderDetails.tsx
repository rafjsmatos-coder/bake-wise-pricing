import { Order } from '@/hooks/useOrders';
import { OrderStatusBadge, ORDER_STATUSES } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/product-cost-calculator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, User, FileText, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onEdit: (order: Order) => void;
  onStatusChange: (orderId: string, status: string) => void;
}

export function OrderDetails({
  open,
  onOpenChange,
  order,
  onEdit,
  onStatusChange,
}: OrderDetailsProps) {
  if (!order) return null;

  const remainingAmount = order.total_amount - order.paid_amount;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(order);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[100dvh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente e data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.client?.name || 'Cliente removido'}</span>
            </div>
            {order.delivery_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Entrega: {format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Status</h4>
            <div className="flex items-center gap-3">
              <Select
                value={order.status}
                onValueChange={(value) => onStatusChange(order.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <OrderStatusBadge status={order.payment_status} type="payment" />
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Itens do Pedido</h4>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product?.name || 'Produto removido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem itens</p>
            )}
          </div>

          {/* Resumo financeiro */}
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="text-green-600">{formatCurrency(order.paid_amount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo restante</span>
                <span className="text-destructive font-medium">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Observações */}
          {order.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Observações</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
