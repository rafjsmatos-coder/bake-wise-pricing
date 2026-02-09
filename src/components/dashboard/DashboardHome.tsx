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
import { 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Sparkles, 
  Box,
  Plus,
  Loader2,
  Cake,
  Settings,
  Users,
  ClipboardList
} from 'lucide-react';

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

  const quickActions = [
    { label: 'Novo Produto', icon: ShoppingBag, page: 'products' },
    { label: 'Nova Receita', icon: BookOpen, page: 'recipes' },
    { label: 'Novo Ingrediente', icon: Package, page: 'ingredients' },
    { label: 'Nova Decoração', icon: Sparkles, page: 'decorations' },
    { label: 'Nova Embalagem', icon: Box, page: 'packaging' },
    { label: 'Novo Cliente', icon: Users, page: 'clients' },
    { label: 'Novo Pedido', icon: ClipboardList, page: 'orders' },
    { label: 'Configurar Custos', icon: Settings, page: 'settings' },
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
          <div className="w-12 sm:w-14 h-12 sm:h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
            <Cake className="h-6 sm:h-7 w-6 sm:w-7 text-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu negócio</p>
          </div>
        </div>
        <StartTourButton variant="card" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4" data-tour="summary-cards">
        {summaryCards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate(card.page)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.count}</p>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card data-tour="quick-actions">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button 
                key={action.label}
                variant="outline" 
                onClick={() => onNavigate(action.page)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Cards Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stock Alerts Card */}
        <StockAlertsCard onNavigate={onNavigate} />
        
        {/* Cost Config Card */}
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
