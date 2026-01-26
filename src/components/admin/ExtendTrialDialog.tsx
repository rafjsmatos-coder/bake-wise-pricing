import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
}

interface ExtendTrialDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExtendTrialDialog({ user, open, onOpenChange, onSuccess }: ExtendTrialDialogProps) {
  const { session } = useAuth();
  const [days, setDays] = useState('7');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !session?.access_token) return;

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1) {
      toast.error('Informe um número válido de dias');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'extendTrial',
          userId: user.id,
          days: daysNum,
        },
      });

      if (error) {
        toast.error('Erro ao estender trial');
        return;
      }

      toast.success(`Trial estendido por ${daysNum} dias`);
      onSuccess();
      onOpenChange(false);
      setDays('7');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao estender trial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estender Trial</DialogTitle>
          <DialogDescription>
            Adicione dias ao período de trial do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Estendendo trial de: <strong>{user?.email}</strong>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Quantidade de dias</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="7"
            />
            <p className="text-xs text-muted-foreground">
              Os dias serão adicionados a partir da data atual ou do fim do trial atual (o que for maior).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Estender Trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
