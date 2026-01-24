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
import { useRecipes, type Recipe } from '@/hooks/useRecipes';
import { useRecipeCategories } from '@/hooks/useRecipeCategories';
import { RecipeForm } from './RecipeForm';
import { RecipeCard } from './RecipeCard';
import { RecipeDetails } from './RecipeDetails';
import { Plus, Search, Book, Loader2 } from 'lucide-react';

export function RecipesList() {
  const { recipes, isLoading, deleteRecipe, duplicateRecipe } = useRecipes();
  const { categories } = useRecipeCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || recipe.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, categoryFilter]);

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormOpen(true);
  };

  const handleView = (recipe: Recipe) => {
    setViewingRecipe(recipe);
    setDetailsOpen(true);
  };

  const handleDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (recipeToDelete) {
      await deleteRecipe.mutateAsync(recipeToDelete.id);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const handleDuplicate = async (recipe: Recipe) => {
    await duplicateRecipe.mutateAsync(recipe);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingRecipe(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Receitas</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e calcule custos automaticamente
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
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

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe)}
              onDelete={() => handleDelete(recipe)}
              onDuplicate={() => handleDuplicate(recipe)}
              onView={() => handleView(recipe)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Book className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || categoryFilter !== 'all'
              ? 'Nenhuma receita encontrada'
              : 'Nenhuma receita cadastrada'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira receita'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira receita
            </Button>
          )}
        </div>
      )}

      {/* Recipe Form Modal */}
      <RecipeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        recipe={editingRecipe}
      />

      {/* Recipe Details Modal */}
      <RecipeDetails
        recipe={viewingRecipe}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={() => {
          setDetailsOpen(false);
          if (viewingRecipe) handleEdit(viewingRecipe);
        }}
        onDuplicate={() => {
          setDetailsOpen(false);
          if (viewingRecipe) handleDuplicate(viewingRecipe);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a receita "{recipeToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
