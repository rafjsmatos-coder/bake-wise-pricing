import { useState } from 'react';
import { useSystemUpdates, type SystemUpdate } from '@/hooks/useSystemUpdates';
import { UpdateForm } from './UpdateForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Newspaper, Loader2, Star, ArrowUpCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  feature: Star,
  improvement: ArrowUpCircle,
  fix: Wrench,
};

const typeLabels: Record<string, string> = {
  feature: 'Novidade',
  improvement: 'Melhoria',
  fix: 'Correção',
};

export function UpdatesManagement() {
  const { updates, isLoading, createUpdate, updateUpdate, deleteUpdate, togglePublish } = useSystemUpdates({ isAdmin: true });
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<SystemUpdate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (showForm || editingUpdate) {
    return (
      <UpdateForm
        update={editingUpdate}
        onSave={(data) => {
          if (editingUpdate) {
            updateUpdate.mutate({ id: editingUpdate.id, ...data }, {
              onSuccess: () => {
                setEditingUpdate(null);
              }
            });
          } else {
            createUpdate.mutate(data, {
              onSuccess: () => {
                setShowForm(false);
              }
            });
          }
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingUpdate(null);
        }}
        isLoading={createUpdate.isPending || updateUpdate.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Novidades</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as atualizações e comunicados do sistema
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Atualização
        </Button>
      </div>

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Nenhuma atualização criada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie uma atualização para informar os usuários sobre novidades
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Atualização
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => {
            const TypeIcon = typeIcons[update.type] || ArrowUpCircle;
            return (
              <div key={update.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <TypeIcon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground">{update.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[update.type] || update.type}
                        </Badge>
                        {update.is_published ? (
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                            Publicado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Rascunho
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{update.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em {format(new Date(update.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUpdate(update)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish.mutate({ id: update.id, is_published: !update.is_published })}>
                        {update.is_published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingId(update.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atualização?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A atualização será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) {
                  deleteUpdate.mutate(deletingId);
                  setDeletingId(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
