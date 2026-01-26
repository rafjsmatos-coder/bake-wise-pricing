import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Headphones, Lightbulb, User, Shield, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SupportTicket, SupportReply, TicketStatus, TicketPriority } from '@/hooks/useSupport';

interface AdminTicketModalProps {
  ticket: SupportTicket & { user_name?: string };
  onClose: () => void;
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export function AdminTicketModal({ ticket, onClose }: AdminTicketModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isSupport = ticket.type === 'support';

  useEffect(() => {
    const fetchReplies = async () => {
      setIsLoadingReplies(true);
      try {
        const { data, error } = await supabase
          .from('support_replies')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setReplies(data || []);
      } catch (error: any) {
        console.error('Error fetching replies:', error);
      } finally {
        setIsLoadingReplies(false);
      }
    };

    fetchReplies();
  }, [ticket.id]);

  const handleSaveChanges = async () => {
    if (status === ticket.status && priority === ticket.priority) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status,
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: 'Ticket atualizado!',
        description: 'As alterações foram salvas.',
      });
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('support_replies')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message: newMessage.trim(),
          is_admin_reply: true,
        });

      if (error) throw error;

      // Refresh replies
      const { data } = await supabase
        .from('support_replies')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      setReplies(data || []);
      setNewMessage('');

      toast({
        title: 'Resposta enviada!',
      });
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Erro ao enviar resposta',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const hasChanges = status !== ticket.status || priority !== ticket.priority;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isSupport 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              {isSupport ? (
                <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{ticket.user_name || 'Usuário'}</span>
                <span>•</span>
                <span>
                  {format(new Date(ticket.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Status and Priority Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSupport && (
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasChanges && (
            <div className="flex items-end">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-[200px] max-h-[300px]">
          <div className="space-y-4 pr-4">
            {/* Original message */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{ticket.user_name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {/* Replies */}
            {isLoadingReplies ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : replies.map((reply) => (
              <div
                key={reply.id}
                className={`rounded-lg p-4 ${
                  reply.is_admin_reply
                    ? 'bg-primary/5 border border-primary/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {reply.is_admin_reply ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {reply.is_admin_reply ? 'Suporte PreciBake' : ticket.user_name || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(reply.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Reply form */}
        <div className="space-y-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva sua resposta..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Resposta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
