import { useState } from 'react';
import { AppLayout, PageType } from '@/components/layout/AppLayout';
import { IngredientsList } from '@/components/ingredients/IngredientsList';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { RecipesList } from '@/components/recipes/RecipesList';
import { RecipeCategoriesList } from '@/components/recipe-categories/RecipeCategoriesList';
import { UserSettings } from '@/components/settings/UserSettings';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('recipes');

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'recipes' && <RecipesList />}
      {currentPage === 'recipe-categories' && <RecipeCategoriesList />}
      {currentPage === 'ingredients' && <IngredientsList />}
      {currentPage === 'categories' && <CategoriesList />}
      {currentPage === 'settings' && <UserSettings />}
    </AppLayout>
  );
}
