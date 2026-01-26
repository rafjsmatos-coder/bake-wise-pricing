import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Package, Loader2 } from 'lucide-react';
import { usePackaging, Packaging } from '@/hooks/usePackaging';
import { usePackagingCategories } from '@/hooks/usePackagingCategories';
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
  const { categories } = usePackagingCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(null);
  const [deletingPackaging, setDeletingPackaging] = useState<Packaging | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return packagingItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'uncategorized' ? !item.category_id : item.category_id === categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [packagingItems, searchQuery, categoryFilter]);

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
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Embalagens</h1>
          <p className="text-muted-foreground">
            {packagingItems.length} embalagem{packagingItems.length !== 1 ? 'ns' : ''} cadastrada{packagingItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Embalagem
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar embalagens..."
            className="pl-10 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="uncategorized">Sem categoria</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Packaging List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            {packagingItems.length === 0 ? 'Nenhuma embalagem cadastrada' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {packagingItems.length === 0
              ? 'Comece adicionando sua primeira embalagem'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {packagingItems.length === 0 && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeira Embalagem
            </Button>
          )}
        </div>
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
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
