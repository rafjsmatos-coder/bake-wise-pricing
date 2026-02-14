import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { useSupport } from '@/hooks/useSupport';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Cake, 
  Package, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Settings,
  ShoppingBag,
  Box,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Headphones,
  Newspaper,
  Loader2,
  Users,
  ClipboardList,
  ShoppingCart,
  DollarSign,
  Lock
} from 'lucide-react';
import { useSystemUpdates } from '@/hooks/useSystemUpdates';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export type PageType = 
  | 'dashboard'
  | 'ingredients' 
  | 'categories' 
  | 'recipes' 
  | 'recipe-categories' 
  | 'decorations' 
  | 'decoration-categories' 
  | 'packaging' 
  | 'packaging-categories' 
  | 'products' 
  | 'product-categories' 
  | 'clients'
  | 'orders'
  | 'shopping-list'
  | 'cash-flow'
  | 'reports'
  | 'receivables'
  | 'settings'
  | 'profile'
  | 'support'
  | 'updates';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { id: PageType; label: string }[];
  badge?: number;
}

interface AppLayoutProps {
  children: ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  canAccess?: boolean;
}

const FREE_PAGES: PageType[] = ['dashboard', 'support'];

export function AppLayout({ children, currentPage, onPageChange, canAccess = true }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();
  const { pendingTicketsCount } = useSupport();
  const { unseenCount } = useSystemUpdates();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setTimeout(() => {
        window.localStorage.removeItem('sb-ektodtogznnlwvcsawgu-auth-token');
        window.location.replace('/');
      }, 100);
    }
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'products', 
      label: 'Produtos', 
      icon: ShoppingBag,
      children: [
        { id: 'product-categories', label: 'Categorias' }
      ]
    },
    { 
      id: 'recipes', 
      label: 'Receitas', 
      icon: BookOpen,
      children: [
        { id: 'recipe-categories', label: 'Categorias' }
      ]
    },
    { id: 'clients', label: 'Clientes', icon: Users },
    { 
      id: 'orders', 
      label: 'Pedidos', 
      icon: ClipboardList,
      children: [
        { id: 'shopping-list', label: 'Lista de Compras' }
      ]
    },
    { 
      id: 'cash-flow', 
      label: 'Financeiro', 
      icon: DollarSign,
      children: [
        { id: 'reports', label: 'Relatórios' },
        { id: 'receivables', label: 'Contas a Receber' }
      ]
    },
    { 
      id: 'ingredients', 
      label: 'Ingredientes', 
      icon: Package,
      children: [
        { id: 'categories', label: 'Categorias' }
      ]
    },
    { 
      id: 'decorations', 
      label: 'Decorações', 
      icon: Sparkles,
      children: [
        { id: 'decoration-categories', label: 'Categorias' }
      ]
    },
    { 
      id: 'packaging', 
      label: 'Embalagens', 
      icon: Box,
      children: [
        { id: 'packaging-categories', label: 'Categorias' }
      ]
    },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'updates', label: 'Novidades', icon: Newspaper, badge: unseenCount > 0 ? unseenCount : undefined },
    { id: 'support', label: 'Suporte', icon: Headphones, badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined },
  ];

  // Map nav item IDs to tour data attributes
  const getTourAttribute = (id: PageType) => {
    const tourMap: Partial<Record<PageType, string>> = {
      ingredients: 'nav-ingredients',
      recipes: 'nav-recipes',
      products: 'nav-products',
      decorations: 'nav-decorations',
      packaging: 'nav-packaging',
      settings: 'nav-settings',
    };
    return tourMap[id];
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some(child => child.id === currentPage) || false;
  };

  const isPageFree = (page: PageType) => FREE_PAGES.includes(page);
  const isItemLocked = (page: PageType) => !canAccess && !isPageFree(page);

  const handleNavClick = (page: PageType) => {
    onPageChange(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Cake className="h-6 w-6 text-accent" />
            <span className="font-semibold">PreciBake</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Cake className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">PreciBake</h1>
              <p className="text-xs text-muted-foreground">O ponto certo do preço</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const hasActiveChild = isChildActive(item);
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                const locked = isItemLocked(item.id);
                return (
                  <Collapsible 
                    key={item.id} 
                    defaultOpen={isActive || hasActiveChild}
                  >
                    <div className={cn("space-y-1", locked && "opacity-50")}>
                      {/* Parent button */}
                      <div className="flex items-center" data-tour={getTourAttribute(item.id)}>
                        <button
                          onClick={() => handleNavClick(item.id)}
                          className={cn(
                            'flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left',
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : hasActiveChild
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            locked && 'pointer-events-none'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium flex-1">{item.label}</span>
                          {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        {!locked && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                            >
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>

                      {/* Children */}
                      {!locked && (
                        <CollapsibleContent>
                          <div className="ml-6 pl-4 border-l border-border space-y-1">
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleNavClick(child.id)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm',
                                  currentPage === child.id
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                <span>{child.label}</span>
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      )}
                    </div>
                  </Collapsible>
                );
              }

              // Simple item without children
              const locked = isItemLocked(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => !locked && handleNavClick(item.id)}
                  data-tour={getTourAttribute(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left',
                    locked
                      ? 'opacity-50 cursor-default text-muted-foreground'
                      : isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium flex-1">{item.label}</span>
                  {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  {!locked && item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || 'Confeiteiro'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.business_name || user?.email}
                </p>
              </div>
            </button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isSigningOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <div className="p-4 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
