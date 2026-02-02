import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type TicketType = 'support' | 'suggestion';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  user_id: string;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  // Joined data for admin view
  user_email?: string;
  user_name?: string;
}

export interface SupportReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  user_name?: string;
}

export interface CreateTicketData {
  type: TicketType;
  subject: string;
  message: string;
  priority?: TicketPriority;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
}

interface UseSupportOptions {
  isAdmin?: boolean;
}

export function useSupport(options: UseSupportOptions = {}) {
  const { user } = useAuth();
  const { isAdmin = false } = options;
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsWithAdminStatus, setTicketsWithAdminStatus] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Buscar tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Buscar perfis dos usuários dos tickets
      const userIds = [...new Set((ticketsData || []).map(t => t.user_id))];
      let profilesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p.full_name || 'Usuário';
        });
      }

      // Type cast the data to match our interface
      const typedTickets: SupportTicket[] = (ticketsData || []).map(ticket => ({
        ...ticket,
        type: ticket.type as TicketType,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        user_name: profilesMap[ticket.user_id] || 'Usuário',
      }));

      setTickets(typedTickets);

      // Buscar status de respostas de admin para cada ticket aberto
      const openTicketIds = typedTickets
        .filter(t => t.status === 'open' || t.status === 'in_progress')
        .map(t => t.id);

      if (openTicketIds.length > 0) {
        const { data: repliesData } = await supabase
          .from('support_replies')
          .select('ticket_id, is_admin_reply, created_at')
          .in('ticket_id', openTicketIds)
          .order('created_at', { ascending: false });

        // Mapear: ticket_id -> tem resposta de admin?
        const adminStatusMap = new Map<string, boolean>();
        const lastReplyMap = new Map<string, { is_admin_reply: boolean }>();

        // Agrupar última resposta por ticket
        repliesData?.forEach(reply => {
          if (!lastReplyMap.has(reply.ticket_id)) {
            lastReplyMap.set(reply.ticket_id, { is_admin_reply: reply.is_admin_reply });
          }
        });

        // Para cada ticket aberto, verificar se tem alguma resposta de admin
        openTicketIds.forEach(ticketId => {
          const hasAnyAdminReply = repliesData?.some(r => r.ticket_id === ticketId && r.is_admin_reply) || false;
          const lastReply = lastReplyMap.get(ticketId);
          // Guardar: última resposta foi de admin?
          adminStatusMap.set(ticketId, lastReply?.is_admin_reply || false);
          // Também guardar se tem qualquer resposta de admin (para admin saber se já respondeu)
          adminStatusMap.set(`has_admin_${ticketId}`, hasAnyAdminReply);
        });

        setTicketsWithAdminStatus(adminStatusMap);
      } else {
        setTicketsWithAdminStatus(new Map());
      }
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Erro ao carregar tickets',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (data: CreateTicketData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          type: data.type,
          subject: data.subject,
          message: data.message,
          priority: data.priority || 'normal',
        });

      if (error) throw error;

      toast({
        title: data.type === 'support' ? 'Ticket criado!' : 'Sugestão enviada!',
        description: 'Obrigado pelo seu feedback. Responderemos em breve.',
      });

      await fetchTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro ao criar ticket',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTicket = async (ticketId: string, data: UpdateTicketData) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Ticket atualizado!',
        description: 'As alterações foram salvas.',
      });

      await fetchTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Erro ao atualizar ticket',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const fetchReplies = useCallback(async (ticketId: string): Promise<SupportReply[]> => {
    try {
      const { data, error } = await supabase
        .from('support_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'Erro ao carregar respostas',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  const addReply = async (ticketId: string, message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('support_replies')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin_reply: isAdmin,
        });

      if (error) throw error;

      toast({
        title: 'Resposta enviada!',
      });

      // Recarregar tickets para atualizar contadores de notificação
      await fetchTickets();
    } catch (error: any) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Erro ao enviar resposta',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Filter helpers
  const supportTickets = tickets.filter(t => t.type === 'support');
  const suggestions = tickets.filter(t => t.type === 'suggestion');
  
  // Contadores de notificação contextuais
  const pendingTicketsCount = (() => {
    if (isAdmin) {
      // Admin: tickets abertos que NÃO têm resposta de admin ainda
      return tickets.filter(t => 
        (t.status === 'open' || t.status === 'in_progress') &&
        !ticketsWithAdminStatus.get(`has_admin_${t.id}`)
      ).length;
    } else {
      // Usuário: tickets próprios onde a última resposta foi de admin (resposta não lida)
      return tickets.filter(t => 
        t.user_id === user?.id &&
        (t.status === 'open' || t.status === 'in_progress') &&
        ticketsWithAdminStatus.get(t.id) === true
      ).length;
    }
  })();

  return {
    tickets,
    supportTickets,
    suggestions,
    isLoading,
    createTicket,
    updateTicket,
    fetchReplies,
    addReply,
    refetch: fetchTickets,
    pendingTicketsCount,
  };
}
