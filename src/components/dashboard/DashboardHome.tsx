import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StartTourButton } from '@/components/tour/StartTourButton';
import { 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Sparkles, 
  Box,
  Plus,
  Loader2,
  Cake,
  Crown,
  Clock,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { prepareExternalNavigation } from '@/lib/open-external';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { recipes, isLoading: loadingRecipes } = useRecipes();
  const { ingredients, isLoading: loadingIngredients } = useIngredients();
  const { decorations, isLoading: loadingDecorations } = useDecorations();
  const { packagingItems, isLoading: loadingPackaging } = usePackaging();
  const { subscription, createCheckout, getCustomerPortalUrl } = useSubscription();
  
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [isProcessingPortal, setIsProcessingPortal] = useState(false);

  const isLoading = loadingProducts || loadingRecipes || loadingIngredients || loadingDecorations || loadingPackaging;

  const handleUpgrade = async () => {
    setIsProcessingUpgrade(true);
    
    // Prepare navigation BEFORE the async call
    const navigate = prepareExternalNavigation();
    
    try {
      const url = await createCheckout();
      navigate(url);
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  const handleManage = async () => {
    setIsProcessingPortal(true);
    
    // Prepare navigation BEFORE the async call
    const navigate = prepareExternalNavigation();
    
    try {
      const url = await getCustomerPortalUrl();
      navigate(url);
    } finally {
      setIsProcessingPortal(false);
    }
  };

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
  ];

  const quickActions = [
    { label: 'Novo Produto', icon: ShoppingBag, page: 'products' },
    { label: 'Nova Receita', icon: BookOpen, page: 'recipes' },
    { label: 'Novo Ingrediente', icon: Package, page: 'ingredients' },
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

      {/* Subscription Status Card */}
      {subscription.status === 'trial' && (
        <Card className={`border-2 ${(subscription.days_remaining || 0) <= 3 ? 'border-destructive/50 bg-destructive/5' : 'border-accent/50 bg-accent/5'}`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(subscription.days_remaining || 0) <= 3 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                  <Clock className={`h-5 w-5 ${(subscription.days_remaining || 0) <= 3 ? 'text-destructive' : 'text-accent'}`} />
                </div>
                <div>
                  <p className="font-medium">Período de Teste</p>
                  <p className={`text-sm ${(subscription.days_remaining || 0) <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {subscription.days_remaining === 1 ? '1 dia restante' : `${subscription.days_remaining} dias restantes`}
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgrade} disabled={isProcessingUpgrade} className="gap-2">
                {isProcessingUpgrade ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                Assinar Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription.status === 'active' && (
        <Card className="border-2 border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10">
                  <Crown className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Plano Premium</p>
                    <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">Ativo</Badge>
                  </div>
                  {subscription.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      Renova {formatDistanceToNow(new Date(subscription.subscription_end), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleManage} disabled={isProcessingPortal} className="gap-2">
                {isProcessingPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-tour="summary-cards">
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

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Comece cadastrando seus <strong>ingredientes</strong> com preços atualizados</p>
            <p>• Crie <strong>receitas</strong> usando os ingredientes para calcular custos</p>
            <p>• Monte <strong>produtos</strong> combinando receitas, decorações e embalagens</p>
            <p>• Defina a <strong>margem de lucro</strong> para obter o preço de venda sugerido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Configure custos de mão de obra, energia, gás e custo operacional nas <strong>Configurações</strong> para cálculos mais precisos.</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2"
              onClick={() => onNavigate('settings')}
            >
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
