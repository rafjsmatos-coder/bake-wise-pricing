import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
  const { session } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !session?.access_token) return;

    if (confirmEmail !== user.email) {
      toast.error('O email digitado não corresponde');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'deleteUser',
          userId: user.id,
        },
      });

      if (error) {
        toast.error('Erro ao deletar usuário');
        return;
      }

      toast.success('Usuário deletado com sucesso');
      onSuccess();
      onOpenChange(false);
      setConfirmEmail('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao deletar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmEmail('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Deletar Usuário
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Esta ação é <strong>irreversível</strong>. Todos os dados do usuário serão
              permanentemente excluídos, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Perfil e configurações</li>
              <li>Todos os ingredientes cadastrados</li>
              <li>Todas as receitas</li>
              <li>Todos os produtos</li>
              <li>Todas as embalagens e decorações</li>
              <li>Histórico de assinatura</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
            <strong>Usuário:</strong> {user?.email}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              Digite o email do usuário para confirmar:
            </Label>
            <Input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user?.email}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || confirmEmail !== user?.email}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deletar Permanentemente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
