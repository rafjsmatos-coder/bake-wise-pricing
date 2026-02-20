import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDecorations, type Decoration } from '@/hooks/useDecorations';
import { useDecorationCategories } from '@/hooks/useDecorationCategories';
import { DecorationCard } from './DecorationCard';
import { DecorationForm } from './DecorationForm';
import { DecorationCategoriesList } from '@/components/decoration-categories/DecorationCategoriesList';
import { Plus, Search, Sparkles, Loader2, Tag } from 'lucide-react';

interface DecorationsListProps {
  initialSearch?: string;
}

export function DecorationsList({ initialSearch = '' }: DecorationsListProps) {
  const { decorations, isLoading, deleteDecoration, duplicateDecoration } = useDecorations();
  const { categories } = useDecorationCategories();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDecoration, setEditingDecoration] = useState<Decoration | null>(null);
  const [deletingDecoration, setDeletingDecoration] = useState<Decoration | null>(null);

  const filteredDecorations = useMemo(() => {
    return decorations.filter((decoration) => {
      const matchesSearch = decoration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        decoration.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'uncategorized' ? !decoration.category_id : decoration.category_id === categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [decorations, searchQuery, categoryFilter]);

  const groupedDecorations = useMemo(() => {
    const groups: Record<string, { name: string; color: string; decorations: Decoration[] }> = {};
    
    filteredDecorations.forEach((decoration) => {
      const categoryId = decoration.category_id || 'uncategorized';
      const categoryName = decoration.decoration_categories?.name || 'Sem categoria';
      const categoryColor = decoration.decoration_categories?.color || '#6b7280';
      
      if (!groups[categoryId]) {
        groups[categoryId] = { name: categoryName, color: categoryColor, decorations: [] };
      }
      groups[categoryId].decorations.push(decoration);
    });

    return Object.entries(groups).sort(([, a], [, b]) => {
      if (a.name === 'Sem categoria') return 1;
      if (b.name === 'Sem categoria') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredDecorations]);

  const handleEdit = (decoration: Decoration) => {
    setEditingDecoration(decoration);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingDecoration) {
      await deleteDecoration.mutateAsync(deletingDecoration.id);
      setDeletingDecoration(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDecoration(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">Decorações</h1>
          <p className="text-muted-foreground">
            {decorations.length} decorações cadastradas
          </p>
        </div>
        <Button onClick={() => { setEditingDecoration(null); setFormOpen(true); }} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Decoração
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Todas</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-4">

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar decorações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="uncategorized">Sem categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#6366f1' }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {decorations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Nenhuma decoração cadastrada</h3>
          <p className="text-muted-foreground text-sm">
            Comece adicionando suas decorações para usar em produtos
          </p>
          <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Decoração
          </Button>
        </div>
      ) : filteredDecorations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Nenhuma decoração encontrada</h3>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros de busca
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedDecorations.map(([categoryId, group]) => (
            <div key={categoryId}>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <span className="text-sm text-muted-foreground">
                  ({group.decorations.length})
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.decorations.map((decoration) => (
                  <DecorationCard
                    key={decoration.id}
                    decoration={decoration}
                    onDuplicate={(dec) => duplicateDecoration.mutate(dec)}
                    onEdit={handleEdit}
                    onDelete={setDeletingDecoration}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <DecorationForm
        open={formOpen}
        onOpenChange={handleFormClose}
        decoration={editingDecoration}
      />

      </TabsContent>

      <TabsContent value="categories" className="mt-4">
        <DecorationCategoriesList />
      </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDecoration} onOpenChange={() => setDeletingDecoration(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Decoração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingDecoration?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
