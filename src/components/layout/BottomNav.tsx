import { LayoutDashboard, ShoppingBag, ClipboardList, DollarSign, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageType } from './AppLayout';

interface BottomNavProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onMoreClick: () => void;
  canAccess?: boolean;
}

const navItems: { id: PageType | 'more'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: ShoppingBag },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList },
  { id: 'cash-flow', label: 'Financeiro', icon: DollarSign },
  { id: 'more', label: 'Mais', icon: MoreHorizontal },
];

export function BottomNav({ currentPage, onPageChange, onMoreClick, canAccess = true }: BottomNavProps) {
  const handleClick = (id: PageType | 'more') => {
    if (id === 'more') {
      onMoreClick();
      return;
    }
    onPageChange(id);
  };

  const isActive = (id: PageType | 'more') => {
    if (id === 'more') return false;
    return currentPage === id;
  };

  return (
    <nav data-tour="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              {...(item.id === 'more' ? { 'data-tour': 'bottom-more' } : item.id === 'products' ? { 'data-tour': 'bottom-products' } : item.id === 'orders' ? { 'data-tour': 'bottom-orders' } : item.id === 'cash-flow' ? { 'data-tour': 'bottom-financial' } : {})}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-colors',
                active ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
