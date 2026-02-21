import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { useSupport } from '@/hooks/useSupport';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './ThemeToggle';
import precibakeLogo from '@/assets/precibake-logo.jpeg';
import { 
  Package, 
  LogOut, 
  BookOpen,
  Settings,
  ShoppingBag,
  Box,
  Sparkles,
  LayoutDashboard,
  Headphones,
  Newspaper,
  Loader2,
  Users,
  ClipboardList,
  ShoppingCart,
  DollarSign,
  Lock,
  BarChart3,
  Receipt,
  Search,
} from 'lucide-react';
import { useSystemUpdates } from '@/hooks/useSystemUpdates';
import { cn } from '@/lib/utils';
import { BottomNav } from './BottomNav';
import { MoreMenu } from './MoreMenu';

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

interface AppLayoutProps {
  children: ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  canAccess?: boolean;
  onSearchOpen?: () => void;
}

const FREE_PAGES: PageType[] = ['dashboard', 'support'];

// Page title mapping
const PAGE_TITLES: Record<PageType, string> = {
  dashboard: 'Dashboard',
  ingredients: 'Ingredientes',
  categories: 'Categorias',
  recipes: 'Receitas',
  'recipe-categories': 'Categorias de Receitas',
  decorations: 'Decorações',
  'decoration-categories': 'Categorias de Decorações',
  packaging: 'Embalagens',
  'packaging-categories': 'Categorias de Embalagens',
  products: 'Produtos',
  'product-categories': 'Categorias de Produtos',
  clients: 'Clientes',
  orders: 'Pedidos',
  'shopping-list': 'Lista de Compras',
  'cash-flow': 'Financeiro',
  reports: 'Relatórios',
  receivables: 'Contas a Receber',
  settings: 'Configurações',
  profile: 'Meu Perfil',
  support: 'Suporte',
  updates: 'Novidades',
};

// Sidebar nav groups
interface SidebarItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AppLayout({ children, currentPage, onPageChange, canAccess = true, onSearchOpen }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();
  const { pendingTicketsCount } = useSupport();
  const { unseenCount } = useSystemUpdates();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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

  const isPageFree = (page: PageType) => FREE_PAGES.includes(page);
  const isItemLocked = (page: PageType) => !canAccess && !isPageFree(page);

  const handleNavClick = (page: PageType) => {
    onPageChange(page);
    setSidebarOpen(false);
  };

  // Sidebar groups for desktop
  const sidebarGroups: { label: string; items: SidebarItem[] }[] = [
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Produtos', icon: ShoppingBag },
        { id: 'recipes', label: 'Receitas', icon: BookOpen },
        { id: 'orders', label: 'Pedidos', icon: ClipboardList },
        { id: 'clients', label: 'Clientes', icon: Users },
      ],
    },
    {
      label: 'Materiais',
      items: [
        { id: 'ingredients', label: 'Ingredientes', icon: Package },
        { id: 'decorations', label: 'Decorações', icon: Sparkles },
        { id: 'packaging', label: 'Embalagens', icon: Box },
      ],
    },
    {
      label: 'Financeiro',
      items: [
        { id: 'cash-flow', label: 'Financeiro', icon: DollarSign },
      ],
    },
  ];

  const bottomItems: SidebarItem[] = [
    { id: 'shopping-list', label: 'Lista de Compras', icon: ShoppingCart },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'updates', label: 'Novidades', icon: Newspaper, badge: unseenCount > 0 ? unseenCount : undefined },
    { id: 'support', label: 'Suporte', icon: Headphones, badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined },
  ];

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

  const renderSidebarItem = (item: SidebarItem) => {
    const locked = isItemLocked(item.id);
    const isActive = currentPage === item.id;

    return (
      <button
        key={item.id}
        onClick={() => !locked && handleNavClick(item.id)}
        data-tour={getTourAttribute(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm',
          locked
            ? 'opacity-50 cursor-default text-muted-foreground'
            : isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-4.5 w-4.5 shrink-0" />
        <span className="font-medium flex-1">{item.label}</span>
        {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
        {!locked && item.badge !== undefined && item.badge > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      {/* Mobile Header - Contextual */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img src={precibakeLogo} alt="PreciBake" className="h-7 w-7 rounded object-contain shrink-0" />
          <h1 className="text-base font-semibold text-foreground truncate">
            {PAGE_TITLES[currentPage] || 'PreciBake'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle className="h-9 w-9" />
          {onSearchOpen && (
            <Button variant="ghost" size="icon" onClick={onSearchOpen} className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <button
            onClick={() => handleNavClick('profile')}
            className="shrink-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-card border-r border-border z-40 flex-col">
        {/* Logo */}
        <div className="h-14 px-5 flex items-center border-b border-border">
          <img src={precibakeLogo} alt="PreciBake" className="h-8 object-contain" />
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(renderSidebarItem)}
              </div>
            </div>
          ))}

          <Separator className="my-2" />

          <div className="space-y-0.5">
            {bottomItems.map(renderSidebarItem)}
          </div>

          <div className="px-3 pt-2">
            <ThemeToggle className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" />
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-muted-foreground hover:text-foreground"
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
      </aside>

      {/* Main Content */}
      <main className="lg:pl-60 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen overflow-x-hidden">
        <div className="p-4 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav
        currentPage={currentPage}
        onPageChange={handleNavClick}
        onMoreClick={() => setMoreMenuOpen(true)}
        canAccess={canAccess}
      />

      {/* More Menu (Mobile) */}
      <MoreMenu
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        currentPage={currentPage}
        onPageChange={(page) => {
          onPageChange(page);
          setMoreMenuOpen(false);
        }}
        canAccess={canAccess}
        profile={profile}
        userEmail={user?.email}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
        getInitials={getInitials}
        unseenCount={unseenCount}
        pendingTicketsCount={pendingTicketsCount}
      />
    </div>
  );
}
