import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { usePackaging, Packaging } from '@/hooks/usePackaging';
import { PackagingCard } from './PackagingCard';
import { PackagingForm } from './PackagingForm';
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

export function PackagingList() {
  const { packagingItems, isLoading, deletePackaging } = usePackaging();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(null);
  const [deletingPackaging, setDeletingPackaging] = useState<Packaging | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = packagingItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (packaging: Packaging) => {
    setEditingPackaging(packaging);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingPackaging) {
      await deletePackaging.mutateAsync(deletingPackaging.id);
      setDeletingPackaging(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingPackaging(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Embalagens</h1>
          <p className="text-muted-foreground">Gerencie suas embalagens e custos</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Embalagem
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar embalagens..."
          className="pl-10 min-h-[44px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Nenhuma embalagem encontrada com esta busca.'
                : 'Nenhuma embalagem cadastrada ainda.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Embalagem
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((packaging) => (
            <PackagingCard
              key={packaging.id}
              packaging={packaging}
              onEdit={() => handleEdit(packaging as Packaging)}
              onDelete={() => setDeletingPackaging(packaging as Packaging)}
            />
          ))}
        </div>
      )}

      <PackagingForm
        open={formOpen}
        onOpenChange={handleFormClose}
        packaging={editingPackaging}
      />

      <AlertDialog open={!!deletingPackaging} onOpenChange={() => setDeletingPackaging(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir embalagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingPackaging?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
