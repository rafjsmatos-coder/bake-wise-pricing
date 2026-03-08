import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Loader2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Trash2,
  Clock,
  CreditCard,
  RefreshCw,
  Plus,
  Ban,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserDetailsModal } from './UserDetailsModal';
import { DeleteUserDialog } from './DeleteUserDialog';

interface Subscription {
  status: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  manualOverride?: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string | null;
  businessName: string | null;
  createdAt: string;
  roles: string[];
  isAdmin: boolean;
  subscription: Subscription | null;
}

const getSubscriptionBadge = (subscription: Subscription | null) => {
  if (!subscription) {
    return <Badge variant="outline" className="text-muted-foreground">Sem assinatura</Badge>;
  }

  switch (subscription.status) {
    case 'trial':
      const trialEnd = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Clock className="h-3 w-3 mr-1" />
          Trial ({daysLeft}d)
        </Badge>
      );
    case 'active':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CreditCard className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="destructive">
          Expirado
        </Badge>
      );
    case 'canceled':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Cancelado
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Pendente
        </Badge>
      );
    default:
      return <Badge variant="outline">{subscription.status}</Badge>;
  }
};

export function UserManagement() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'promote' | 'demote';
  }>({ open: false, user: null, action: 'promote' });
  
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const [subscriptionDialog, setSubscriptionDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'extend' | 'activate' | 'sync' | 'cancel' | 'expire' | 'removeOverride';
    days: number;
  }>({ open: false, user: null, action: 'extend', days: 7 });

  const perPage = 20;

  const fetchUsers = useCallback(async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'list',
          page,
          perPage,
          search,
        },
      });

      if (error) {
        toast.error('Erro ao carregar usuários');
        console.error(error);
        return;
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdmin = async () => {
    if (!confirmDialog.user || !session?.access_token) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'toggleAdmin',
          userId: confirmDialog.user.id,
          makeAdmin: confirmDialog.action === 'promote',
        },
      });

      if (error) {
        toast.error('Erro ao alterar permissão');
        return;
      }

      toast.success(
        confirmDialog.action === 'promote'
          ? 'Usuário promovido a admin'
          : 'Permissão de admin removida'
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao alterar permissão');
    } finally {
      setConfirmDialog({ open: false, user: null, action: 'promote' });
    }
  };

  const handleSubscriptionAction = async () => {
    if (!subscriptionDialog.user || !session?.access_token) return;

    try {
      let body: Record<string, unknown> = { userId: subscriptionDialog.user.id };

      switch (subscriptionDialog.action) {
        case 'extend':
          body.action = 'extendTrial';
          body.days = subscriptionDialog.days;
          break;
        case 'activate':
          body.action = 'updateSubscription';
          body.status = 'active';
          body.daysToAdd = subscriptionDialog.days;
          break;
        case 'sync':
          body.action = 'syncFromStripe';
          break;
        case 'cancel':
          body.action = 'updateSubscription';
          body.status = 'canceled';
          break;
        case 'expire':
          body.action = 'updateSubscription';
          body.status = 'expired';
          break;
        case 'removeOverride':
          body.action = 'updateSubscription';
          body.manualOverride = false;
          break;
      }

      const { error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body,
      });

      if (error) {
        toast.error('Erro ao atualizar assinatura');
        return;
      }

      const messages: Record<string, string> = {
        extend: `Trial estendido em ${subscriptionDialog.days} dias`,
        activate: `Assinatura ativada por ${subscriptionDialog.days} dias`,
        sync: 'Sincronizado com Stripe',
        cancel: 'Assinatura cancelada',
        expire: 'Assinatura expirada',
        removeOverride: 'Override manual removido',
      };
      toast.success(messages[subscriptionDialog.action]);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar assinatura');
    } finally {
      setSubscriptionDialog({ open: false, user: null, action: 'extend', days: 7 });
    }
  };

  const totalPages = Math.ceil(total / perPage);

  const getDialogTitle = () => {
    switch (subscriptionDialog.action) {
      case 'extend': return 'Estender Trial';
      case 'activate': return 'Ativar Premium';
      case 'sync': return 'Sincronizar com Stripe';
      case 'cancel': return 'Cancelar Assinatura';
      case 'expire': return 'Expirar Assinatura';
      case 'removeOverride': return 'Remover Override Manual';
      default: return '';
    }
  };

  const getDialogDescription = () => {
    const email = subscriptionDialog.user?.email;
    switch (subscriptionDialog.action) {
      case 'extend': return `Adicionar dias ao trial de ${email}`;
      case 'activate': return `Definir duração do premium para ${email}`;
      case 'sync': return `Sincronizar dados de assinatura do Stripe para ${email}`;
      case 'cancel': return `Tem certeza que deseja cancelar a assinatura de ${email}? O acesso será revogado.`;
      case 'expire': return `Tem certeza que deseja expirar a assinatura de ${email}? O acesso será revogado imediatamente.`;
      case 'removeOverride': return `Remover o override manual de ${email}? O controle será devolvido ao Stripe.`;
      default: return '';
    }
  };

  const showDaysInput = subscriptionDialog.action === 'extend' || subscriptionDialog.action === 'activate';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                     <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Nome</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead className="hidden sm:table-cell">Role</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium max-w-[180px] truncate">{user.email}</TableCell>
                          <TableCell className="hidden sm:table-cell">{user.fullName || '-'}</TableCell>
                          <TableCell>
                            {getSubscriptionBadge(user.subscription)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {user.isAdmin ? (
                              <Badge variant="default" className="bg-primary">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline">Usuário</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem
                                  onClick={() => setDetailsModal({ open: true, userId: user.id })}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                
                                {/* Subscription Actions */}
                                <DropdownMenuItem
                                  onClick={() => setSubscriptionDialog({ 
                                    open: true, 
                                    user, 
                                    action: 'extend',
                                    days: 7 
                                  })}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Estender Trial
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setSubscriptionDialog({ 
                                    open: true, 
                                    user, 
                                    action: 'activate',
                                    days: 30 
                                  })}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Ativar Premium
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setSubscriptionDialog({ 
                                    open: true, 
                                    user, 
                                    action: 'sync',
                                    days: 0 
                                  })}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Sincronizar Stripe
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Cancel / Expire */}
                                <DropdownMenuItem
                                  onClick={() => setSubscriptionDialog({ 
                                    open: true, 
                                    user, 
                                    action: 'cancel',
                                    days: 0 
                                  })}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Cancelar Assinatura
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setSubscriptionDialog({ 
                                    open: true, 
                                    user, 
                                    action: 'expire',
                                    days: 0 
                                  })}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Expirar Assinatura
                                </DropdownMenuItem>

                                {/* Remove Override - only if manual_override is true */}
                                {user.subscription?.manualOverride && (
                                  <DropdownMenuItem
                                    onClick={() => setSubscriptionDialog({ 
                                      open: true, 
                                      user, 
                                      action: 'removeOverride',
                                      days: 0 
                                    })}
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Remover Override Manual
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                {user.isAdmin ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setConfirmDialog({ open: true, user, action: 'demote' })
                                    }
                                  >
                                    <ShieldOff className="h-4 w-4 mr-2" />
                                    Remover Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setConfirmDialog({ open: true, user, action: 'promote' })
                                    }
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Tornar Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteDialog({ open: true, user })}
                                  className="text-destructive focus:text-destructive"
                                  disabled={user.isAdmin}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deletar Usuário
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {total} usuário{total !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <UserDetailsModal
        userId={detailsModal.userId}
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ open, userId: open ? detailsModal.userId : null })}
      />

      <DeleteUserDialog
        user={deleteDialog.user}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: open ? deleteDialog.user : null })}
        onSuccess={fetchUsers}
      />

      {/* Admin Toggle Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, user: null, action: 'promote' })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'promote'
                ? 'Promover a Administrador'
                : 'Remover Administrador'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'promote'
                ? `Tem certeza que deseja dar permissões de administrador para ${confirmDialog.user?.email}?`
                : `Tem certeza que deseja remover as permissões de administrador de ${confirmDialog.user?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAdmin}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Action Dialog */}
      <Dialog
        open={subscriptionDialog.open}
        onOpenChange={(open) =>
          !open && setSubscriptionDialog({ open: false, user: null, action: 'extend', days: 7 })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>
          
          {showDaysInput && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="days" className="text-right">
                  Dias
                </Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={365}
                  value={subscriptionDialog.days}
                  onChange={(e) => setSubscriptionDialog(prev => ({
                    ...prev,
                    days: parseInt(e.target.value) || 7
                  }))}
                  className="col-span-3"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSubscriptionDialog({ open: false, user: null, action: 'extend', days: 7 })}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubscriptionAction}
              variant={subscriptionDialog.action === 'cancel' || subscriptionDialog.action === 'expire' ? 'destructive' : 'default'}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
