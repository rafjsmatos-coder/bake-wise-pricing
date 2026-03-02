import { useState, useEffect } from 'react';
import { Order, OrderFormData, OrderItemFormData } from '@/hooks/useOrders';
import { useClients } from '@/hooks/useClients';
import { OrderProductSelector } from '@/components/orders/OrderProductSelector';
import { ORDER_STATUSES } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSubmit: (data: OrderFormData) => void;
  isLoading?: boolean;
}

export function OrderForm({ open, onOpenChange, order, onSubmit, isLoading }: OrderFormProps) {
  const { clients } = useClients();

  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('pending');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paidAmountStr, setPaidAmountStr] = useState('');
  const [discountStr, setDiscountStr] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemFormData[]>([]);

  useEffect(() => {
    if (order) {
      setClientId(order.client_id);
      setStatus(order.status);
      if (order.delivery_date) {
        const d = new Date(order.delivery_date);
        setDeliveryDate(d);
        setDeliveryTime(format(d, 'HH:mm'));
      } else {
        setDeliveryDate(undefined);
        setDeliveryTime('');
      }
      setPaidAmountStr(order.paid_amount ? String(order.paid_amount).replace('.', ',') : '');
      setDiscountStr(order.discount ? String(order.discount).replace('.', ',') : '');
      setNotes(order.notes || '');
      setItems(
        order.order_items?.map((item) => ({
          product_id: item.product_id || '',
          product_name: item.product_name || item.product?.name || 'Produto',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          cost_at_sale: item.cost_at_sale,
          profit_at_sale: item.profit_at_sale,
          notes: item.notes,
        })) || []
      );
    } else {
      setClientId('');
      setStatus('pending');
      setDeliveryDate(undefined);
      setDeliveryTime('');
      setPaidAmountStr('');
      setDiscountStr('');
      setNotes('');
      setItems([]);
    }
  }, [order, open]);

  const totalItems = items.reduce((sum, item) => sum + item.total_price, 0);
  const discount = parseFloat(discountStr.replace(',', '.')) || 0;
  const effectiveTotal = Math.max(0, totalItems - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    let deliveryDateISO: string | null = null;
    if (deliveryDate) {
      const d = new Date(deliveryDate);
      if (deliveryTime) {
        const [hours, minutes] = deliveryTime.split(':').map(Number);
        d.setHours(hours, minutes, 0, 0);
      }
      deliveryDateISO = d.toISOString();
    }

    onSubmit({
      client_id: clientId,
      client_name: selectedClientName || 'Cliente',
      status,
      delivery_date: deliveryDateISO,
      paid_amount: parseFloat(paidAmountStr.replace(',', '.')) || 0,
      discount,
      notes: notes || null,
      items,
    });
  };

  const clientItems = clients.map((c) => ({ id: c.id, name: c.name }));
  const selectedClientName = clients.find((c) => c.id === clientId)?.name;
  const isEditing = !!order;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[100dvh] overflow-y-auto overflow-x-hidden sm:max-h-[85vh]" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente * {selectedClientName && <span className="text-muted-foreground font-normal">({selectedClientName})</span>}</Label>
            <SearchableCombobox
              items={clientItems}
              selectedIds={clientId ? [clientId] : []}
              onSelect={(id) => setClientId(id)}
              placeholder="Selecionar cliente..."
              searchPlaceholder="Buscar cliente..."
              emptyMessage="Nenhum cliente encontrado"
              title="Selecionar Cliente"
            />
          </div>

          {/* Produtos */}
          <OrderProductSelector items={items} onChange={setItems} />

          {/* Data e hora de entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !deliveryDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="text-base" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status do pedido</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desconto */}
          <div className="space-y-2">
            <Label>Desconto (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={discountStr}
              onChange={(e) => setDiscountStr(e.target.value)}
              placeholder="0,00"
              className="text-base"
            />
          </div>

          {/* Pagamento */}
          <div className="space-y-2">
            <Label>Valor pago (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={paidAmountStr}
              onChange={(e) => setPaidAmountStr(e.target.value)}
              placeholder="0,00"
              className="text-base"
            />
            {items.length > 0 && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalItems)}</p>
                {discount > 0 && <p>Desconto: -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</p>}
                <p className="font-medium text-foreground">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(effectiveTotal)}</p>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre o pedido..." rows={3} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !clientId || items.length === 0}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
