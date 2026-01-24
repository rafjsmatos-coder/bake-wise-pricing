import { useState } from 'react';
import { AppLayout, PageType } from '@/components/layout/AppLayout';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { SubscriptionSettings } from '@/components/subscription/SubscriptionSettings';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { IngredientsList } from '@/components/ingredients/IngredientsList';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { RecipesList } from '@/components/recipes/RecipesList';
import { RecipeCategoriesList } from '@/components/recipe-categories/RecipeCategoriesList';
import { DecorationsList } from '@/components/decorations/DecorationsList';
import { DecorationCategoriesList } from '@/components/decoration-categories/DecorationCategoriesList';
import { PackagingList } from '@/components/packaging/PackagingList';
import { PackagingCategoriesList } from '@/components/packaging-categories/PackagingCategoriesList';
import { ProductsList } from '@/components/products/ProductsList';
import { ProductCategoriesList } from '@/components/product-categories/ProductCategoriesList';
import { UserSettings } from '@/components/settings/UserSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      <SubscriptionBanner />
      <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {currentPage === 'dashboard' && <DashboardHome onNavigate={(page) => setCurrentPage(page as PageType)} />}
        {currentPage === 'products' && <ProductsList />}
        {currentPage === 'product-categories' && <ProductCategoriesList />}
        {currentPage === 'recipes' && <RecipesList />}
        {currentPage === 'recipe-categories' && <RecipeCategoriesList />}
        {currentPage === 'ingredients' && <IngredientsList />}
        {currentPage === 'categories' && <CategoriesList />}
        {currentPage === 'decorations' && <DecorationsList />}
        {currentPage === 'decoration-categories' && <DecorationCategoriesList />}
        {currentPage === 'packaging' && <PackagingList />}
        {currentPage === 'packaging-categories' && <PackagingCategoriesList />}
        {currentPage === 'subscription' && <SubscriptionSettings />}
        {currentPage === 'settings' && <UserSettings />}
        {currentPage === 'profile' && <ProfileSettings />}
      </AppLayout>
    </div>
  );
}
