import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
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

export function useSupport() {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast the data to match our interface
      const typedTickets: SupportTicket[] = (data || []).map(ticket => ({
        ...ticket,
        type: ticket.type as TicketType,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
      }));

      setTickets(typedTickets);
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

  const fetchReplies = async (ticketId: string): Promise<SupportReply[]> => {
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
  };

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
  };
}
