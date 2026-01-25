import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ChefHat, 
  Calculator, 
  TrendingUp, 
  Box,
  Shield
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: 'Gestão de Ingredientes',
      description: 'Cadastre todos os ingredientes com preços, fornecedores e controle de estoque. Atualize preços facilmente.'
    },
    {
      icon: ChefHat,
      title: 'Receitas Detalhadas',
      description: 'Crie receitas com ingredientes, quantidades e instruções. O custo é calculado automaticamente.'
    },
    {
      icon: Calculator,
      title: 'Cálculo Automático',
      description: 'Custos de ingredientes, mão de obra, gás, energia e embalagem. Tudo calculado em tempo real.'
    },
    {
      icon: TrendingUp,
      title: 'Margem de Lucro',
      description: 'Defina suas margens de lucro e veja o preço final sugerido. Nunca mais venda no prejuízo.'
    },
    {
      icon: Box,
      title: 'Embalagens e Decorações',
      description: 'Inclua o custo de embalagens, fitas, caixas e decorações no preço final dos produtos.'
    },
    {
      icon: Shield,
      title: 'Margem de Segurança',
      description: 'Adicione uma margem de segurança para cobrir desperdícios e variações de preço.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para precificar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para gerenciar ingredientes, receitas e calcular preços justos
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
