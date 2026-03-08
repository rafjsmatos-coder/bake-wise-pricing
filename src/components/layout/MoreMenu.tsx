import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Package,
  BookOpen,
  Sparkles,
  Box,
  Users,
  ShoppingCart,
  Settings,
  Newspaper,
  Headphones,
  LogOut,
  Loader2,
  Lock,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageType } from './AppLayout';

interface MoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  canAccess?: boolean;
  profile?: { full_name?: string | null; business_name?: string | null; avatar_url?: string | null } | null;
  userEmail?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
  getInitials: () => string;
  unseenCount?: number;
  pendingTicketsCount?: number;
  isAdmin?: boolean;
}

const FREE_PAGES: PageType[] = ['dashboard', 'support'];

interface MenuItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MoreMenu({
  open,
  onOpenChange,
  currentPage,
  onPageChange,
  canAccess = true,
  profile,
  userEmail,
  onSignOut,
  isSigningOut,
  getInitials,
  unseenCount = 0,
  pendingTicketsCount = 0,
  isAdmin = false,
}: MoreMenuProps) {
  const handleNavigate = (page: PageType) => {
    onPageChange(page);
    onOpenChange(false);
  };

  const isLocked = (page: PageType) => !canAccess && !FREE_PAGES.includes(page);

  const sections: { label: string; items: MenuItem[] }[] = [
    {
      label: 'Materiais',
      items: [
        { id: 'ingredients', label: 'Ingredientes', icon: Package },
        { id: 'recipes', label: 'Receitas', icon: BookOpen },
        { id: 'decorations', label: 'Decorações', icon: Sparkles },
        { id: 'packaging', label: 'Embalagens', icon: Box },
      ],
    },
    {
      label: 'Gestão',
      items: [
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'shopping-list', label: 'Lista de Compras', icon: ShoppingCart },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { id: 'settings', label: 'Configurações', icon: Settings },
        { id: 'whatsapp-templates', label: 'Mensagens WhatsApp', icon: MessageCircle },
        { id: 'updates', label: 'Novidades', icon: Newspaper, badge: unseenCount > 0 ? unseenCount : undefined },
        { id: 'support', label: 'Suporte', icon: Headphones, badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl pb-0 flex flex-col">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto space-y-4 pb-2 flex-1 min-h-0">
          {/* User profile section */}
          <button
            onClick={() => handleNavigate('profile')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'Confeiteiro'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.business_name || userEmail}
              </p>
            </div>
          </button>

          <Separator />

          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-medium uppercase text-muted-foreground px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const locked = isLocked(item.id);
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !locked && handleNavigate(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left min-h-[44px]',
                        locked
                          ? 'opacity-50 cursor-default text-muted-foreground'
                          : active
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
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
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={onSignOut}
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
      </SheetContent>
    </Sheet>
  );
}
