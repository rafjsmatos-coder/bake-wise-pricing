import { useState } from 'react';
import { AppLayout, PageType } from '@/components/layout/AppLayout';
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
import { SupportPage } from '@/components/support/SupportPage';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const { canAccess, isLoading, initialized, error, checkSubscription } = useSubscription();
  const { signOut } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkSubscription();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Loading state - show spinner until fully initialized with valid access status
  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Error state - show retry UI
  if (error && !canAccess) {
    const errorMessages: Record<string, { title: string; description: string }> = {
      TOKEN_MISSING: {
        title: 'Sessão expirada',
        description: 'Sua sessão expirou. Tente novamente ou faça login novamente.',
      },
      NETWORK_ERROR: {
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      },
      TIMEOUT: {
        title: 'Tempo esgotado',
        description: 'A verificação demorou mais que o esperado. Tente novamente.',
      },
    };

    const errorInfo = errorMessages[error] || {
      title: 'Erro inesperado',
      description: 'Ocorreu um erro ao verificar sua assinatura.',
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">{errorInfo.title}</h1>
            <p className="text-muted-foreground">{errorInfo.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="min-h-[44px]"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tentar novamente
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="min-h-[44px]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Paywall for expired users
  if (initialized && !canAccess) {
    return <SubscriptionPaywall />;
  }

  return (
    <>
      <TrialBanner />
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
        {currentPage === 'settings' && <UserSettings />}
        {currentPage === 'profile' && <ProfileSettings />}
        {currentPage === 'support' && <SupportPage />}
      </AppLayout>
    </>
  );
}
