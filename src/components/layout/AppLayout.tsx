import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Cake, 
  Package, 
  Tags, 
  LogOut, 
  Menu, 
  X,
  ChefHat,
  BookOpen,
  FolderOpen,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PageType = 'ingredients' | 'categories' | 'recipes' | 'recipe-categories' | 'decorations' | 'decoration-categories' | 'packaging' | 'packaging-categories' | 'settings';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function AppLayout({ children, currentPage, onPageChange }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'recipes' as const, label: 'Receitas', icon: BookOpen },
    { id: 'recipe-categories' as const, label: 'Categorias de Receitas', icon: FolderOpen },
    { id: 'ingredients' as const, label: 'Ingredientes', icon: Package },
    { id: 'categories' as const, label: 'Categorias de Ingredientes', icon: Tags },
    { id: 'decorations' as const, label: 'Decorações', icon: Cake },
    { id: 'decoration-categories' as const, label: 'Categorias de Decorações', icon: FolderOpen },
    { id: 'packaging' as const, label: 'Embalagens', icon: Package },
    { id: 'packaging-categories' as const, label: 'Categorias de Embalagens', icon: FolderOpen },
    { id: 'settings' as const, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
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
            <span className="font-semibold">Confeitaria Pro</span>
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
              <h1 className="font-bold text-foreground">Confeitaria Pro</h1>
              <p className="text-xs text-muted-foreground">Precificação</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                  currentPage === item.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || 'Confeiteiro'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
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
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
