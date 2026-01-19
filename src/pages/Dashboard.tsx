import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IngredientsList } from '@/components/ingredients/IngredientsList';
import { CategoriesList } from '@/components/categories/CategoriesList';

type Page = 'ingredients' | 'categories';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('ingredients');

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'ingredients' && <IngredientsList />}
      {currentPage === 'categories' && <CategoriesList />}
    </AppLayout>
  );
}
