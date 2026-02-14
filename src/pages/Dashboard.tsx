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
import { UpdatesPage } from '@/components/updates/UpdatesPage';
import { ClientsList } from '@/components/clients/ClientsList';
import { OrdersList } from '@/components/orders/OrdersList';
import { ShoppingList } from '@/components/orders/ShoppingList';
import { TransactionsList } from '@/components/financial/TransactionsList';
import { RevenueReport } from '@/components/financial/RevenueReport';
import { ReceivablesList } from '@/components/financial/ReceivablesList';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Pages that expired users can still access
const FREE_PAGES: PageType[] = ['dashboard', 'support'];

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
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

  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !canAccess) {
    const errorMessages: Record<string, { title: string; description: string }> = {
      TOKEN_MISSING: { title: 'Sessão expirada', description: 'Sua sessão expirou. Tente novamente ou faça login novamente.' },
      NETWORK_ERROR: { title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.' },
      TIMEOUT: { title: 'Tempo esgotado', description: 'A verificação demorou mais que o esperado. Tente novamente.' },
    };
    const errorInfo = errorMessages[error] || { title: 'Erro inesperado', description: 'Ocorreu um erro ao verificar sua assinatura.' };

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
            <Button onClick={handleRetry} disabled={isRetrying} className="min-h-[44px]">
              {isRetrying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="min-h-[44px]">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSearchNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  // Determine if the current page is accessible
  const isPageAccessible = canAccess || FREE_PAGES.includes(currentPage);

  // Force navigation to allowed page if expired user tries to access restricted page
  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const renderPageContent = () => {
    // If user doesn't have access and page is not free, show paywall inline
    if (!canAccess && !FREE_PAGES.includes(currentPage)) {
      return <SubscriptionPaywall />;
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageType)} />;
      case 'products': return <ProductsList />;
      case 'product-categories': return <ProductCategoriesList />;
      case 'recipes': return <RecipesList />;
      case 'recipe-categories': return <RecipeCategoriesList />;
      case 'ingredients': return <IngredientsList />;
      case 'categories': return <CategoriesList />;
      case 'decorations': return <DecorationsList />;
      case 'decoration-categories': return <DecorationCategoriesList />;
      case 'packaging': return <PackagingList />;
      case 'packaging-categories': return <PackagingCategoriesList />;
      case 'clients': return <ClientsList />;
      case 'orders': return <OrdersList />;
      case 'shopping-list': return <ShoppingList />;
      case 'cash-flow': return <TransactionsList />;
      case 'reports': return <RevenueReport />;
      case 'receivables': return <ReceivablesList />;
      case 'settings': return <UserSettings />;
      case 'profile': return <ProfileSettings />;
      case 'support': return <SupportPage />;
      case 'updates': return <UpdatesPage />;
      default: return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageType)} />;
    }
  };

  return (
    <>
      <TrialBanner />
      <GlobalSearch 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
        onNavigate={handleSearchNavigate}
      />
      <AppLayout currentPage={currentPage} onPageChange={handlePageChange} canAccess={canAccess}>
        {renderPageContent()}
      </AppLayout>
    </>
  );
}
