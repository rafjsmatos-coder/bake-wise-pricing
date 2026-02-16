import { useState, useMemo } from 'react';
import { useIngredients, type Ingredient } from '@/hooks/useIngredients';
import { useCategories } from '@/hooks/useCategories';
import { IngredientCard } from './IngredientCard';
import { IngredientForm } from './IngredientForm';
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
import { CategoriesList } from '@/components/categories/CategoriesList';
import { Plus, Search, Package, Loader2, Tag } from 'lucide-react';

export function IngredientsList() {
  const { ingredients, isLoading, deleteIngredient } = useIngredients();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.brand?.toLowerCase().includes(search.toLowerCase()) ||
        ing.supplier?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'all' ||
        (categoryFilter === 'uncategorized' && !ing.category_id) ||
        ing.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [ingredients, search, categoryFilter]);

  const groupedIngredients = useMemo(() => {
    if (categoryFilter !== 'all') {
      const catName = categoryFilter === 'uncategorized' 
        ? 'Sem categoria' 
        : categories.find(c => c.id === categoryFilter)?.name || categoryFilter;
      return { [catName]: filteredIngredients };
    }

    const groups: Record<string, Ingredient[]> = {};
    
    filteredIngredients.forEach((ing) => {
      const key = ing.categories?.name || 'Sem categoria';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(ing);
    });

    // Sort groups by category name
    const sortedGroups: Record<string, Ingredient[]> = {};
    Object.keys(groups)
      .sort((a, b) => {
        if (a === 'Sem categoria') return 1;
        if (b === 'Sem categoria') return -1;
        return a.localeCompare(b);
      })
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [filteredIngredients, categoryFilter, categories]);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingIngredient) {
      await deleteIngredient.mutateAsync(deletingIngredient.id);
      setDeletingIngredient(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingIngredient(null);
    }
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Ingredientes</h1>
          <p className="text-muted-foreground">
            {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''} cadastrado{ingredients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Novo Ingrediente
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Todos</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ingredientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 min-h-[44px]"
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
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ingredients List */}
      {filteredIngredients.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            {ingredients.length === 0 ? 'Nenhum ingrediente cadastrado' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {ingredients.length === 0
              ? 'Comece adicionando seu primeiro ingrediente'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {ingredients.length === 0 && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Ingrediente
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIngredients).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                {categories.find((c) => c.name === category)?.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: categories.find((c) => c.name === category)?.color,
                    }}
                  />
                )}
                {category}
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((ingredient) => (
                  <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onEdit={handleEdit}
                    onDelete={setDeletingIngredient}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <IngredientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        ingredient={editingIngredient}
      />

      </TabsContent>

      <TabsContent value="categories" className="mt-4">
        <CategoriesList />
      </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingIngredient} onOpenChange={() => setDeletingIngredient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ingrediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingIngredient?.name}"?
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
