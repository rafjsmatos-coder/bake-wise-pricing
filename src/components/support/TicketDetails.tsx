import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, Headphones, Lightbulb, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupport } from '@/hooks/useSupport';
import type { SupportTicket, SupportReply, TicketStatus } from '@/hooks/useSupport';

interface TicketDetailsProps {
  ticket: SupportTicket;
  onBack: () => void;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberto', variant: 'default' },
  in_progress: { label: 'Em Andamento', variant: 'secondary' },
  resolved: { label: 'Resolvido', variant: 'outline' },
  closed: { label: 'Fechado', variant: 'outline' },
};

export function TicketDetails({ ticket, onBack }: TicketDetailsProps) {
  const { fetchReplies, addReply } = useSupport();
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isSupport = ticket.type === 'support';
  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  useEffect(() => {
    let isMounted = true;
    
    const loadReplies = async () => {
      setIsLoading(true);
      const data = await fetchReplies(ticket.id);
      if (isMounted) {
        setReplies(data);
        setIsLoading(false);
      }
    };
    
    loadReplies();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  const handleSendReply = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      await addReply(ticket.id, newMessage.trim());
      const data = await fetchReplies(ticket.id);
      setReplies(data);
      setNewMessage('');
    } catch {
      // Error handled in hook
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="pb-4">
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
              <h2 className="text-xl font-semibold">{ticket.subject}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  Criado em {format(new Date(ticket.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Original message */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Você</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {/* Replies */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Respostas</h3>
              {replies.map((reply) => (
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
                      {reply.is_admin_reply ? 'Suporte PreciBake' : 'Você'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Reply form */}
          {!isClosed ? (
            <div className="space-y-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva sua mensagem..."
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendReply}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Este {isSupport ? 'ticket' : 'sugestão'} foi {ticket.status === 'resolved' ? 'resolvido' : 'fechado'}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
