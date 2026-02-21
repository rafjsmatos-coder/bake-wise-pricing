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
import { Calendar, User, FileText, Pencil, MessageCircle, Copy } from 'lucide-react';
import { cleanPhone } from '@/lib/format-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onEdit: (order: Order) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onDuplicate?: (order: Order) => void;
}

export function OrderDetails({ open, onOpenChange, order, onEdit, onStatusChange, onDuplicate }: OrderDetailsProps) {
  if (!order) return null;

  const discount = order.discount || 0;
  const effectiveTotal = order.total_amount - discount;
  const remainingAmount = effectiveTotal - order.paid_amount;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(order);
  };

  const clientWhatsapp = order.client?.whatsapp ? cleanPhone(order.client.whatsapp) : '';
  const hasWhatsapp = clientWhatsapp.length >= 10;

  const handleSendQuote = () => {
    if (!hasWhatsapp) return;
    const clientName = order.client?.name || 'Cliente';
    const itemsText = order.order_items?.map(
      (item) => `• ${item.quantity}x ${item.product?.name || 'Produto'} - ${formatCurrency(item.total_price)}`
    ).join('\n') || '';
    const deliveryText = order.delivery_date
      ? `\nEntrega: ${format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
      : '';
    const notesText = order.notes ? `\nObservações: ${order.notes}` : '';
    
    let discountText = '';
    let totalText = `\nTotal: ${formatCurrency(order.total_amount)}`;
    if (discount > 0) {
      discountText = `\nDesconto: -${formatCurrency(discount)}`;
      totalText = `\nSubtotal: ${formatCurrency(order.total_amount)}${discountText}\n*Total: ${formatCurrency(effectiveTotal)}*`;
    }
    
    const message = `Olá ${clientName}! Segue o orçamento do seu pedido:\n\n${itemsText}${totalText}${deliveryText}${notesText}\n\nObrigado(a) pela preferência! 🎂`;
    const url = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendDeliveryReminder = () => {
    if (!hasWhatsapp) return;
    const clientName = order.client?.name || 'Cliente';
    const deliveryText = order.delivery_date
      ? format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : 'a combinar';
    const itemsText = order.order_items?.map(
      (item) => `• ${item.quantity}x ${item.product?.name || 'Produto'}`
    ).join('\n') || '';
    
    const message = `Olá ${clientName}! 😊\n\nLembrando que a entrega do seu pedido está marcada para *${deliveryText}*.\n\n${itemsText}\n\nAlguma dúvida, é só me chamar! 🎂`;
    const url = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendConfirmation = () => {
    if (!hasWhatsapp) return;
    const clientName = order.client?.name || 'Cliente';
    const deliveryText = order.delivery_date
      ? `\nEntrega: ${format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
      : '';
    
    const message = `Olá ${clientName}! ✅\n\nSeu pedido foi *confirmado*!${deliveryText}\n\nObrigado(a) pela confiança! 🎂`;
    const url = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[100dvh] overflow-y-auto overflow-x-hidden sm:max-h-[85vh]" style={{ touchAction: 'pan-y' }}>
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <div className="flex gap-2 flex-wrap pt-1">
            {hasWhatsapp && (
              <Button variant="outline" size="sm" onClick={handleSendQuote} className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                <MessageCircle className="h-4 w-4 mr-1" />
                Orçamento
              </Button>
            )}
            {hasWhatsapp && (
              <Button variant="outline" size="sm" onClick={handleSendConfirmation} className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                <MessageCircle className="h-4 w-4 mr-1" />
                Confirmar
              </Button>
            )}
            {hasWhatsapp && order.delivery_date && (
              <Button variant="outline" size="sm" onClick={handleSendDeliveryReminder} className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                <MessageCircle className="h-4 w-4 mr-1" />
                Lembrete
              </Button>
            )}
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onDuplicate(order); }}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleEdit}>
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
                <span>Entrega: {format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Status</h4>
            <div className="flex items-center gap-3">
              <Select value={order.status} onValueChange={(value) => onStatusChange(order.id, value)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name || 'Produto removido'}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x {formatCurrency(item.unit_price)}</p>
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
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="text-accent">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="font-bold">{formatCurrency(effectiveTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="text-green-600">{formatCurrency(order.paid_amount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo restante</span>
                <span className="text-destructive font-medium">{formatCurrency(remainingAmount)}</span>
              </div>
            )}
          </div>

          {/* Observações */}
          {order.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Observações</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap break-words">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
