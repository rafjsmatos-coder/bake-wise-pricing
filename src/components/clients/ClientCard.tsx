import { Client } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, Phone, MessageCircle, ShoppingBag, RotateCcw } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onReactivate?: () => void;
}

export function ClientCard({ client, onView, onEdit, onDelete, onReactivate }: ClientCardProps) {
  const isInactive = !client.is_active;

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${isInactive ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
          {isInactive && <Badge variant="secondary" className="text-xs shrink-0">Inativo</Badge>}
        </div>
        {client.city && client.state && (
          <p className="text-xs text-muted-foreground truncate">{client.city}, {client.state}</p>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
        {client.phone && (<p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{client.phone}</span></p>)}
        {client.whatsapp && (<p className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{client.whatsapp}</span></p>)}
      </div>

      {/* Footer with orders + actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{client.orders_count || 0} pedido{(client.orders_count || 0) !== 1 ? 's' : ''}</span>
          </div>
          {client.instagram && (
            <Badge variant="secondary" className="text-xs">@{client.instagram.replace('@', '')}</Badge>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {isInactive && onReactivate ? (
            <Button variant="outline" size="sm" onClick={onReactivate} className="h-8 gap-1 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />Reativar
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => onView(client)} className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(client)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(client)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
