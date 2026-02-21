import { Client } from '@/hooks/useClients';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Instagram,
  FileText,
  Pencil,
  ClipboardList,
} from 'lucide-react';

interface ClientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit: (client: Client) => void;
}

export function ClientDetails({ open, onOpenChange, client, onEdit }: ClientDetailsProps) {
  const { orders } = useOrders();

  if (!client) return null;

  const hasAddress = client.address || client.neighborhood || client.city || client.state || client.zip_code;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(client);
  };

  const clientOrders = (orders || [])
    .filter(o => o.client_id === client.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalSpent = clientOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[100dvh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{client.name}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contato */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contato</h4>
            <div className="space-y-2 text-sm">
              {client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.whatsapp && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>{client.whatsapp}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.instagram && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Instagram className="h-4 w-4 shrink-0" />
                  <span>@{client.instagram.replace('@', '')}</span>
                </div>
              )}
              {!client.phone && !client.whatsapp && !client.email && !client.instagram && (
                <p className="text-muted-foreground italic">Nenhum contato cadastrado</p>
              )}
            </div>
          </div>

          {/* Endereço */}
          {hasAddress && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Endereço</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  {client.address && <p>{client.address}</p>}
                  {client.neighborhood && <p>{client.neighborhood}</p>}
                  <p>
                    {[client.city, client.state].filter(Boolean).join(', ')}
                    {client.zip_code && ` - CEP: ${client.zip_code}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {client.notes && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Observações</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}

          {/* Histórico de Pedidos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Histórico de Pedidos ({clientOrders.length})
            </h4>
            {clientOrders.length > 0 ? (
              <div className="space-y-2">
                {clientOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} type="order" />
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                ))}
                {clientOrders.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{clientOrders.length - 10} pedidos anteriores
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhum pedido registrado</p>
            )}
          </div>

          {/* Resumo */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de pedidos</span>
              <Badge variant="secondary">{clientOrders.length}</Badge>
            </div>
            {totalSpent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total gasto</span>
                <span className="font-bold text-primary">{formatCurrency(totalSpent)}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
