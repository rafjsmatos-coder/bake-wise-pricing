import { Client } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, Phone, MessageCircle, ShoppingBag } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({ client, onView, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
          {client.city && client.state && (
            <p className="text-xs text-muted-foreground truncate">
              {client.city}, {client.state}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
          <Button variant="ghost" size="icon" onClick={() => onView(client)} className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(client)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(client)} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
        {client.phone && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.phone}</span>
          </p>
        )}
        {client.whatsapp && (
          <p className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.whatsapp}</span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{client.orders_count || 0} pedido{(client.orders_count || 0) !== 1 ? 's' : ''}</span>
        </div>
        {client.instagram && (
          <Badge variant="secondary" className="text-xs">
            @{client.instagram.replace('@', '')}
          </Badge>
        )}
      </div>
    </div>
  );
}
