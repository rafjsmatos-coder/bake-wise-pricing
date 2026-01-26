import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Headphones, Lightbulb, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/hooks/useSupport';

interface TicketListProps {
  tickets: SupportTicket[];
  onSelect: (ticket: SupportTicket) => void;
  emptyMessage: string;
  emptyDescription: string;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberto', variant: 'default' },
  in_progress: { label: 'Em Andamento', variant: 'secondary' },
  resolved: { label: 'Resolvido', variant: 'outline' },
  closed: { label: 'Fechado', variant: 'outline' },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-muted text-muted-foreground' },
  normal: { label: 'Normal', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export function TicketList({ tickets, onSelect, emptyMessage, emptyDescription }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Headphones className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground text-sm max-w-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const status = statusConfig[ticket.status];
        const priority = priorityConfig[ticket.priority];
        const isSupport = ticket.type === 'support';

        return (
          <Card
            key={ticket.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(ticket)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSupport 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                {isSupport ? (
                  <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium truncate">{ticket.subject}</h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {ticket.message}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                  
                  {isSupport && ticket.priority !== 'normal' && (
                    <Badge className={priority.className}>
                      {priority.label}
                    </Badge>
                  )}

                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(ticket.created_at), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
