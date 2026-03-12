import { Order } from '@/hooks/useOrders';
import { useUserSettings } from '@/hooks/useUserSettings';
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
  const { settings } = useUserSettings();

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

  const buildVariables = () => {
    const clientName = order.client?.name || 'Cliente';
    const itemsText = order.order_items?.map(
      (item) => `• ${item.quantity}x ${item.product?.name || 'Produto'} - ${formatCurrency(item.total_price)}`
    ).join('\n') || '';
    const itemsSimple = order.order_items?.map(
      (item) => `• ${item.quantity}x ${item.product?.name || 'Produto'}`
    ).join('\n') || '';
    const deliveryText = order.delivery_date
      ? `\nEntrega: ${format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
      : '';
    const deliveryDateOnly = order.delivery_date
      ? format(new Date(order.delivery_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : 'a combinar';
    const notesText = order.notes ? `\nObservações: ${order.notes}` : '';

    let totalText = `\nTotal: ${formatCurrency(order.total_amount)}`;
    if (discount > 0) {
      const discountLine = `\nDesconto: -${formatCurrency(discount)}`;
      totalText = `\nSubtotal: ${formatCurrency(order.total_amount)}${discountLine}\n*Total: ${formatCurrency(effectiveTotal)}*`;
    }

    return { clientName, itemsText, itemsSimple, deliveryText, deliveryDateOnly, notesText, totalText };
  };

  const applyTemplate = (template: string, vars: ReturnType<typeof buildVariables>) => {
    return template
      .split('{cliente}').join(vars.clientName)
      .split('{itens}').join(vars.itemsText)
      .split('{total}').join(vars.totalText)
      .split('{entrega}').join(vars.deliveryText)
      .split('{data_entrega}').join(vars.deliveryDateOnly)
      .split('{observacoes}').join(vars.notesText);
  };

  const DEFAULT_QUOTE = 'Olá {cliente}! Segue o orçamento do seu pedido:\n\n{itens}\n{total}{entrega}{observacoes}\n\nObrigado(a) pela preferência! 🎂';
  const DEFAULT_CONFIRMATION = 'Olá {cliente}! ✅\n\nSeu pedido foi *confirmado*!{entrega}\n\nObrigado(a) pela confiança! 🎂';
  const DEFAULT_REMINDER = 'Olá {cliente}! 😊\n\nLembrando que a entrega do seu pedido está marcada para *{data_entrega}*.\n\n{itens}\n\nAlguma dúvida, é só me chamar! 🎂';

  const handleSendQuote = () => {
    if (!hasWhatsapp) return;
    const vars = buildVariables();
    const template = settings?.whatsapp_quote_template || DEFAULT_QUOTE;
    const message = applyTemplate(template, vars);
    const url = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendDeliveryReminder = () => {
    if (!hasWhatsapp) return;
    const vars = buildVariables();
    // For reminder, use simple items list (without prices)
    const template = settings?.whatsapp_reminder_template || DEFAULT_REMINDER;
    const message = applyTemplate(template, { ...vars, itemsText: vars.itemsSimple });
    const url = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendConfirmation = () => {
    if (!hasWhatsapp) return;
    const vars = buildVariables();
    const template = settings?.whatsapp_confirmation_template || DEFAULT_CONFIRMATION;
    const message = applyTemplate(template, vars);
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
            {!hasWhatsapp && order.client_id && (
              <p className="text-xs text-muted-foreground italic py-1">
                Cadastre o WhatsApp do cliente para enviar mensagens.
              </p>
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
              <span className="font-medium">{order.client?.name || order.client_name || 'Cliente'}</span>
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
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name || 'Produto removido'}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem itens</p>
            )}
          </div>

          {/* Resumo financeiro */}
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground truncate">Subtotal</span>
              <span className="shrink-0">{formatCurrency(order.total_amount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground truncate">Desconto</span>
                <span className="text-accent shrink-0">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground font-medium truncate">Total</span>
              <span className="font-bold shrink-0">{formatCurrency(effectiveTotal)}</span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground truncate">Valor pago</span>
              <span className="text-green-600 shrink-0">{formatCurrency(order.paid_amount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground truncate">Saldo restante</span>
                <span className="text-destructive font-medium shrink-0">{formatCurrency(remainingAmount)}</span>
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
