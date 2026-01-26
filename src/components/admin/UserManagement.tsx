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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search,
  Loader2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserDetailsModal } from './UserDetailsModal';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { ExtendTrialDialog } from './ExtendTrialDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  businessName: string | null;
  createdAt: string;
  subscriptionStatus: string;
  trialEnd: string | null;
  subscriptionEnd: string | null;
  roles: string[];
  isAdmin: boolean;
}

export function UserManagement() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  
  const [editSubscriptionDialog, setEditSubscriptionDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  
  const [extendTrialDialog, setExtendTrialDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

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
          statusFilter,
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
  }, [session?.access_token, page, search, statusFilter]);

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      trial: { variant: 'secondary', label: 'Trial' },
      active: { variant: 'default', label: 'Ativo' },
      expired: { variant: 'destructive', label: 'Expirado' },
      canceled: { variant: 'outline', label: 'Cancelado' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPages = Math.ceil(total / perPage);

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
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
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
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.fullName || '-'}</TableCell>
                          <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
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
                                <DropdownMenuItem
                                  onClick={() => setEditSubscriptionDialog({ open: true, user })}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Assinatura
                                </DropdownMenuItem>
                                {(user.subscriptionStatus === 'trial' || user.subscriptionStatus === 'expired') && (
                                  <DropdownMenuItem
                                    onClick={() => setExtendTrialDialog({ open: true, user })}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Estender Trial
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} usuários
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

      <EditSubscriptionDialog
        user={editSubscriptionDialog.user}
        open={editSubscriptionDialog.open}
        onOpenChange={(open) => setEditSubscriptionDialog({ open, user: open ? editSubscriptionDialog.user : null })}
        onSuccess={fetchUsers}
      />

      <ExtendTrialDialog
        user={extendTrialDialog.user}
        open={extendTrialDialog.open}
        onOpenChange={(open) => setExtendTrialDialog({ open, user: open ? extendTrialDialog.user : null })}
        onSuccess={fetchUsers}
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
    </>
  );
}
