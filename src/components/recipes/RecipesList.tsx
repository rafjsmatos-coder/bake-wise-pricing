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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecipes, type Recipe } from '@/hooks/useRecipes';
import { useRecipeCategories } from '@/hooks/useRecipeCategories';
import { RecipeForm } from './RecipeForm';
import { RecipeCard } from './RecipeCard';
import { RecipeDetails } from './RecipeDetails';
import { RecipeCategoriesList } from '@/components/recipe-categories/RecipeCategoriesList';
import { DeleteOrDeactivateDialog } from '@/components/shared/DeleteOrDeactivateDialog';
import { Plus, Search, Book, Loader2, Tag } from 'lucide-react';

interface RecipesListProps {
  initialSearch?: string;
}

export function RecipesList({ initialSearch = '' }: RecipesListProps) {
  const { recipes, isLoading, deleteRecipe, duplicateRecipe, deactivateRecipe } = useRecipes();
  const { categories } = useRecipeCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || 
        (categoryFilter === 'uncategorized' ? !recipe.category_id : recipe.category_id === categoryFilter);
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
            {recipes.length} receita{recipes.length !== 1 ? 's' : ''} cadastrada{recipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
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
      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe)}
              onDelete={() => setDeletingRecipe(recipe)}
              onDuplicate={() => handleDuplicate(recipe)}
              onView={() => handleView(recipe)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            {searchTerm || categoryFilter !== 'all'
              ? 'Nenhuma receita encontrada'
              : 'Nenhuma receita cadastrada'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira receita'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Criar primeira receita
            </Button>
          )}
        </div>
      )}
      </TabsContent>

      <TabsContent value="categories" className="mt-4">
        <RecipeCategoriesList />
      </TabsContent>
      </Tabs>

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

      {/* Delete / Deactivate Dialog */}
      {deletingRecipe && (
        <DeleteOrDeactivateDialog
          open={!!deletingRecipe}
          onOpenChange={() => setDeletingRecipe(null)}
          entityType="recipe"
          entityId={deletingRecipe.id}
          entityName={deletingRecipe.name}
          onHardDelete={async () => {
            await deleteRecipe.mutateAsync(deletingRecipe.id);
            setDeletingRecipe(null);
          }}
          onDeactivate={async () => {
            await deactivateRecipe.mutateAsync(deletingRecipe.id);
            setDeletingRecipe(null);
          }}
          isLoading={deleteRecipe.isPending || deactivateRecipe.isPending}
        />
      )}
    </div>
  );
}
