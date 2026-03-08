import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Headphones, Lightbulb, Loader2, Eye, Filter, X, HelpCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminTicketModal } from './AdminTicketModal';
import { FAQManagement } from './FAQManagement';
import type { SupportTicket, TicketStatus, TicketPriority, TicketType } from '@/hooks/useSupport';

interface AdminTicket extends SupportTicket {
  user_email?: string;
  user_name?: string;
  needsAttention?: boolean;
  hoursSinceCreation?: number;
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
  urgent: { label: 'Urgente', className: 'bg-destructive/20 text-destructive' },
};

export function SupportManagement() {
  
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for all tickets
      const userIds = [...new Set((data || []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Fetch latest admin replies per ticket to calculate SLA
      const ticketIds = (data || []).map(t => t.id);
      const { data: replies } = ticketIds.length > 0
        ? await supabase
            .from('support_replies')
            .select('ticket_id, created_at, is_admin_reply')
            .in('ticket_id', ticketIds)
            .order('created_at', { ascending: false })
        : { data: [] };

      const lastAdminReplyMap = new Map<string, string>();
      (replies || []).forEach(r => {
        if (r.is_admin_reply && !lastAdminReplyMap.has(r.ticket_id)) {
          lastAdminReplyMap.set(r.ticket_id, r.created_at);
        }
      });

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const typedTickets: AdminTicket[] = (data || []).map(ticket => {
        const lastAdminReply = lastAdminReplyMap.get(ticket.id);
        const createdAt = new Date(ticket.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const isOpen = ticket.status === 'open' || ticket.status === 'in_progress';
        const needsAttention = isOpen && !lastAdminReply && hoursSinceCreation > 24;

        return {
          ...ticket,
          type: ticket.type as TicketType,
          status: ticket.status as TicketStatus,
          priority: ticket.priority as TicketPriority,
          user_name: profileMap.get(ticket.user_id) || 'Usuário',
          needsAttention,
          hoursSinceCreation: Math.round(hoursSinceCreation),
        };
      });

      setTickets(typedTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filterTickets = (type: TicketType) => {
    return tickets
      .filter(t => t.type === type)
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
      .filter(t => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          t.subject.toLowerCase().includes(query) ||
          t.message.toLowerCase().includes(query) ||
          t.user_name?.toLowerCase().includes(query)
        );
      });
  };

  const supportTickets = filterTickets('support');
  const suggestions = filterTickets('suggestion');

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all';

  const renderTable = (items: AdminTicket[], showPriority: boolean) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            {showPriority ? (
              <Headphones className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">
            Nenhum {showPriority ? 'ticket' : 'sugestão'} encontrado
          </h3>
          <p className="text-muted-foreground text-sm">
            {hasActiveFilters ? 'Tente ajustar os filtros' : 'Ainda não há registros'}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              {showPriority && <TableHead>Prioridade</TableHead>}
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((ticket) => {
              const status = statusConfig[ticket.status];
              const priority = priorityConfig[ticket.priority];

              return (
                <TableRow key={ticket.id} className={ticket.needsAttention ? 'bg-destructive/5' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {ticket.needsAttention && (
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      {ticket.user_name || 'Usuário'}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  {showPriority && (
                    <TableCell>
                      <Badge className={priority.className}>{priority.label}</Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por assunto, mensagem ou usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="support" className="space-y-4">
        <TabsList>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Tickets
            <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
              {supportTickets.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugestões
            <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
              {suggestions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support">
          {renderTable(supportTickets, true)}
        </TabsContent>

        <TabsContent value="suggestions">
          {renderTable(suggestions, false)}
        </TabsContent>

        <TabsContent value="faq">
          <FAQManagement />
        </TabsContent>
      </Tabs>

      {/* Modal */}
      {selectedTicket && (
        <AdminTicketModal
          ticket={selectedTicket}
          onClose={() => {
            setSelectedTicket(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}
