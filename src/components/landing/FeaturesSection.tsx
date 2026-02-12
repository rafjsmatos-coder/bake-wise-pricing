import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ChefHat, 
  Calculator, 
  TrendingUp, 
  Box,
  Shield,
  ClipboardList,
  Users,
  MessageCircle,
  DollarSign,
  ShoppingCart,
  Smartphone
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Calculator,
      title: 'Precificação Automática',
      description: 'Custos de ingredientes, mão de obra, gás, energia e embalagem calculados em tempo real.'
    },
    {
      icon: Package,
      title: 'Gestão de Ingredientes',
      description: 'Cadastre ingredientes com preços, fornecedores e controle de estoque com alertas.'
    },
    {
      icon: ChefHat,
      title: 'Receitas Detalhadas',
      description: 'Crie receitas com ingredientes e quantidades. O custo total é calculado automaticamente.'
    },
    {
      icon: ClipboardList,
      title: 'Gestão de Pedidos',
      description: 'Controle pedidos do orçamento à entrega, com status, pagamentos e calendário.'
    },
    {
      icon: Users,
      title: 'Cadastro de Clientes',
      description: 'Organize seus clientes com contato, endereço, histórico de pedidos e WhatsApp.'
    },
    {
      icon: MessageCircle,
      title: 'Orçamento via WhatsApp',
      description: 'Envie orçamentos detalhados direto pelo WhatsApp com um clique.'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Fluxo de caixa, relatórios de faturamento, lucro e contas a receber em um só lugar.'
    },
    {
      icon: ShoppingCart,
      title: 'Lista de Compras',
      description: 'Lista de compras automática baseada nos pedidos da semana. Compartilhe via WhatsApp.'
    },
    {
      icon: TrendingUp,
      title: 'Margem de Lucro',
      description: 'Defina suas margens e veja o preço final sugerido. Nunca mais venda no prejuízo.'
    },
    {
      icon: Box,
      title: 'Embalagens e Decorações',
      description: 'Inclua o custo de embalagens, fitas, caixas e decorações no preço final.'
    },
    {
      icon: Shield,
      title: 'Controle de Estoque',
      description: 'Alertas de estoque baixo e baixa automática ao entregar pedidos.'
    },
    {
      icon: Smartphone,
      title: 'Funciona no Celular',
      description: 'Use como aplicativo no celular. Instale direto do navegador, sem loja de apps.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para gerenciar sua confeitaria
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Da precificação ao controle financeiro — ferramentas profissionais para seu negócio crescer
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-accent/30 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
