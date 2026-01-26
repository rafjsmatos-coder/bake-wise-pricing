import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  trialEnd: string | null;
  subscriptionEnd: string | null;
}

interface EditSubscriptionDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditSubscriptionDialog({ user, open, onOpenChange, onSuccess }: EditSubscriptionDialogProps) {
  const { session } = useAuth();
  const [status, setStatus] = useState('');
  const [trialEnd, setTrialEnd] = useState<Date | undefined>();
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setStatus(user.subscriptionStatus || 'trial');
      setTrialEnd(user.trialEnd ? new Date(user.trialEnd) : undefined);
      setSubscriptionEnd(user.subscriptionEnd ? new Date(user.subscriptionEnd) : undefined);
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user || !session?.access_token) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'updateSubscription',
          userId: user.id,
          status,
          trialEnd: trialEnd?.toISOString() || null,
          subscriptionEnd: subscriptionEnd?.toISOString() || null,
        },
      });

      if (error) {
        toast.error('Erro ao atualizar assinatura');
        return;
      }

      toast.success('Assinatura atualizada com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Assinatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Editando assinatura de: <strong>{user?.email}</strong>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fim do Trial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !trialEnd && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {trialEnd ? format(trialEnd, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={trialEnd}
                  onSelect={setTrialEnd}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fim da Assinatura</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !subscriptionEnd && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {subscriptionEnd ? format(subscriptionEnd, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={subscriptionEnd}
                  onSelect={setSubscriptionEnd}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
