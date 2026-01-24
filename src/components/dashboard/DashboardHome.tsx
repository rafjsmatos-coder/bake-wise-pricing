import { useProducts } from '@/hooks/useProducts';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Sparkles, 
  Box,
  Plus,
  Loader2,
  Cake
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

  const isLoading = loadingProducts || loadingRecipes || loadingIngredients || loadingDecorations || loadingPackaging;

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
          <Cake className="h-7 w-7 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
      <Card>
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
