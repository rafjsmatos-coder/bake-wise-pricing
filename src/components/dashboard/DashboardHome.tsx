import { useProducts } from '@/hooks/useProducts';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import { useClients } from '@/hooks/useClients';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StartTourButton } from '@/components/tour/StartTourButton';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { StockAlertsCard } from '@/components/dashboard/StockAlertsCard';
import { CostConfigCard } from '@/components/dashboard/CostConfigCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import precibakeIcon from '@/assets/precibake-icon.jpeg';
import { 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Sparkles, 
  Box,
  Loader2,
  Users,
  ClipboardList,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { isToday } from 'date-fns';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { recipes, isLoading: loadingRecipes } = useRecipes();
  const { ingredients, isLoading: loadingIngredients } = useIngredients();
  const { decorations, isLoading: loadingDecorations } = useDecorations();
  const { packagingItems, isLoading: loadingPackaging } = usePackaging();
  const { clients, isLoading: loadingClients } = useClients();
  const { orders, isLoading: loadingOrders } = useOrders();

  const isLoading = loadingProducts || loadingRecipes || loadingIngredients || loadingDecorations || loadingPackaging || loadingClients || loadingOrders;

  const summaryCards = [
    { 
      title: 'Produtos', 
      count: products?.length || 0, 
      icon: ShoppingBag, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      page: 'products'
    },
    { 
      title: 'Receitas', 
      count: recipes?.length || 0, 
      icon: BookOpen, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      page: 'recipes'
    },
    { 
      title: 'Ingredientes', 
      count: ingredients?.length || 0, 
      icon: Package, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      page: 'ingredients'
    },
    { 
      title: 'Decorações', 
      count: decorations?.length || 0, 
      icon: Sparkles, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      page: 'decorations'
    },
    { 
      title: 'Embalagens', 
      count: packagingItems?.length || 0, 
      icon: Box, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      page: 'packaging'
    },
    { 
      title: 'Clientes', 
      count: clients?.length || 0, 
      icon: Users, 
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      page: 'clients'
    },
    { 
      title: 'Pedidos', 
      count: orders?.length || 0, 
      icon: ClipboardList, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      page: 'orders'
    },
  ];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4" data-tour="welcome">
        <div className="flex items-center gap-4">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <img src={precibakeIcon} alt="PreciBake" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu negócio</p>
          </div>
        </div>
        <StartTourButton variant="card" />
      </div>

      {/* Summary Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" data-tour="summary-cards">
        {summaryCards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-md transition-shadow shrink-0 min-w-[100px]"
            onClick={() => onNavigate(card.page)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{card.count}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{card.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Deliveries - Highlighted */}
      {(() => {
        const todayOrders = (orders || [])
          .filter(o => o.delivery_date && ['pending', 'in_production', 'ready'].includes(o.status) && isToday(new Date(o.delivery_date)))
          .sort((a, b) => new Date(a.delivery_date!).getTime() - new Date(b.delivery_date!).getTime());

        if (todayOrders.length === 0) return null;

        return (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Entregas Hoje ({todayOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 p-3 bg-card rounded-lg cursor-pointer hover:bg-muted transition-colors border border-border"
                  onClick={() => onNavigate('orders')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(o.delivery_date!), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} type="order" />
                  <span className="text-sm font-medium shrink-0">{formatCurrency(o.total_amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* Upcoming Deliveries */}
      {(() => {
        const now = new Date();
        const upcomingOrders = (orders || [])
          .filter(o => o.delivery_date && ['pending', 'in_production', 'ready'].includes(o.status) && new Date(o.delivery_date) >= now && !isToday(new Date(o.delivery_date)))
          .sort((a, b) => new Date(a.delivery_date!).getTime() - new Date(b.delivery_date!).getTime())
          .slice(0, 5);

        if (upcomingOrders.length === 0) return null;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-accent" />
                Próximas Entregas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => onNavigate('orders')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(o.delivery_date!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} type="order" />
                  <span className="text-sm font-medium shrink-0">{formatCurrency(o.total_amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* Important Cards Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <StockAlertsCard onNavigate={onNavigate} />
        <CostConfigCard onNavigate={onNavigate} />
      </div>

      {/* Subscription + Tips Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <SubscriptionCard />

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Configure seus <strong>custos operacionais</strong> nas Configurações (forno, energia, mão de obra)</p>
            <p>2. Cadastre seus <strong>ingredientes</strong> com preços atualizados</p>
            <p>3. Crie <strong>receitas</strong> usando os ingredientes para calcular custos automaticamente</p>
            <p>4. Cadastre <strong>decorações</strong> e <strong>embalagens</strong> que você utiliza</p>
            <p>5. Monte <strong>produtos</strong> combinando receitas, decorações e embalagens com sua margem de lucro</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
