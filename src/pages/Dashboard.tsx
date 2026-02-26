import { useState, lazy, Suspense } from 'react';
import { AppLayout, PageType } from '@/components/layout/AppLayout';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy-loaded page components
const IngredientsList = lazy(() => import('@/components/ingredients/IngredientsList').then(m => ({ default: m.IngredientsList })));
const CategoriesList = lazy(() => import('@/components/categories/CategoriesList').then(m => ({ default: m.CategoriesList })));
const RecipesList = lazy(() => import('@/components/recipes/RecipesList').then(m => ({ default: m.RecipesList })));
const RecipeCategoriesList = lazy(() => import('@/components/recipe-categories/RecipeCategoriesList').then(m => ({ default: m.RecipeCategoriesList })));
const DecorationsList = lazy(() => import('@/components/decorations/DecorationsList').then(m => ({ default: m.DecorationsList })));
const DecorationCategoriesList = lazy(() => import('@/components/decoration-categories/DecorationCategoriesList').then(m => ({ default: m.DecorationCategoriesList })));
const PackagingList = lazy(() => import('@/components/packaging/PackagingList').then(m => ({ default: m.PackagingList })));
const PackagingCategoriesList = lazy(() => import('@/components/packaging-categories/PackagingCategoriesList').then(m => ({ default: m.PackagingCategoriesList })));
const ProductsList = lazy(() => import('@/components/products/ProductsList').then(m => ({ default: m.ProductsList })));
const ProductCategoriesList = lazy(() => import('@/components/product-categories/ProductCategoriesList').then(m => ({ default: m.ProductCategoriesList })));
const UserSettings = lazy(() => import('@/components/settings/UserSettings').then(m => ({ default: m.UserSettings })));
const WhatsAppTemplatesSection = lazy(() => import('@/components/settings/WhatsAppTemplatesSection').then(m => ({ default: m.WhatsAppTemplatesSection })));
const ProfileSettings = lazy(() => import('@/components/settings/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const SupportPage = lazy(() => import('@/components/support/SupportPage').then(m => ({ default: m.SupportPage })));
const UpdatesPage = lazy(() => import('@/components/updates/UpdatesPage').then(m => ({ default: m.UpdatesPage })));
const ClientsList = lazy(() => import('@/components/clients/ClientsList').then(m => ({ default: m.ClientsList })));
const OrdersList = lazy(() => import('@/components/orders/OrdersList').then(m => ({ default: m.OrdersList })));
const ShoppingList = lazy(() => import('@/components/orders/ShoppingList').then(m => ({ default: m.ShoppingList })));
const FinancialPage = lazy(() => import('@/components/financial/FinancialPage').then(m => ({ default: m.FinancialPage })));

// Pages that expired users can still access
const FREE_PAGES: PageType[] = ['dashboard', 'support'];

const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
  </div>
);

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
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

  const handleSearchNavigate = (page: string, searchTerm?: string) => {
    setCurrentPage(page as PageType);
    setSearchFilter(searchTerm || '');
  };

  // Determine if the current page is accessible
  const isPageAccessible = canAccess || FREE_PAGES.includes(currentPage);

  // Force navigation to allowed page if expired user tries to access restricted page
  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    setSearchFilter('');
  };

  const renderPageContent = () => {
    // If user doesn't have access and page is not free, show paywall inline
    if (!canAccess && !FREE_PAGES.includes(currentPage)) {
      return <SubscriptionPaywall />;
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageType)} />;
      case 'products': return <Suspense fallback={<PageLoader />}><ProductsList initialSearch={searchFilter} /></Suspense>;
      case 'product-categories': return <Suspense fallback={<PageLoader />}><ProductCategoriesList /></Suspense>;
      case 'recipes': return <Suspense fallback={<PageLoader />}><RecipesList initialSearch={searchFilter} /></Suspense>;
      case 'recipe-categories': return <Suspense fallback={<PageLoader />}><RecipeCategoriesList /></Suspense>;
      case 'ingredients': return <Suspense fallback={<PageLoader />}><IngredientsList initialSearch={searchFilter} /></Suspense>;
      case 'categories': return <Suspense fallback={<PageLoader />}><CategoriesList /></Suspense>;
      case 'decorations': return <Suspense fallback={<PageLoader />}><DecorationsList initialSearch={searchFilter} /></Suspense>;
      case 'decoration-categories': return <Suspense fallback={<PageLoader />}><DecorationCategoriesList /></Suspense>;
      case 'packaging': return <Suspense fallback={<PageLoader />}><PackagingList initialSearch={searchFilter} /></Suspense>;
      case 'packaging-categories': return <Suspense fallback={<PageLoader />}><PackagingCategoriesList /></Suspense>;
      case 'clients': return <Suspense fallback={<PageLoader />}><ClientsList initialSearch={searchFilter} /></Suspense>;
      case 'orders': return <Suspense fallback={<PageLoader />}><OrdersList initialSearch={searchFilter} /></Suspense>;
      case 'shopping-list': return <Suspense fallback={<PageLoader />}><ShoppingList /></Suspense>;
      case 'cash-flow': return <Suspense fallback={<PageLoader />}><FinancialPage initialTab="cash-flow" /></Suspense>;
      case 'reports': return <Suspense fallback={<PageLoader />}><FinancialPage initialTab="reports" /></Suspense>;
      case 'receivables': return <Suspense fallback={<PageLoader />}><FinancialPage initialTab="receivables" /></Suspense>;
      case 'settings': return <Suspense fallback={<PageLoader />}><UserSettings /></Suspense>;
      case 'whatsapp-templates': return <Suspense fallback={<PageLoader />}><WhatsAppTemplatesSection /></Suspense>;
      case 'profile': return <Suspense fallback={<PageLoader />}><ProfileSettings /></Suspense>;
      case 'support': return <Suspense fallback={<PageLoader />}><SupportPage /></Suspense>;
      case 'updates': return <Suspense fallback={<PageLoader />}><UpdatesPage /></Suspense>;
      default: return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageType)} />;
    }
  };

  return (
    <>
      
      <GlobalSearch 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
        onNavigate={handleSearchNavigate}
      />
      <AppLayout currentPage={currentPage} onPageChange={handlePageChange} canAccess={canAccess} onSearchOpen={() => setSearchOpen(true)}>
        {renderPageContent()}
      </AppLayout>
    </>
  );
}
