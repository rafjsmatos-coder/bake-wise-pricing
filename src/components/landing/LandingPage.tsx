import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cake, 
  Calculator, 
  TrendingUp, 
  Package, 
  ChefHat, 
  CheckCircle2, 
  Crown,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Users,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Cake className="w-5 h-5 text-accent" />
              </div>
              <span className="font-bold text-xl text-foreground">Confeitaria Pro</span>
            </div>
            <Button onClick={onGetStarted} variant="outline" className="gap-2">
              Entrar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </nav>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              14 dias grátis para testar
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Precifique suas receitas com{' '}
              <span className="text-accent">precisão profissional</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              O sistema completo para confeiteiros que querem saber exatamente quanto cobrar. 
              Calcule custos, defina margens e aumente sua lucratividade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={onGetStarted} className="gap-2 text-base px-8">
                Começar Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={onGetStarted} className="gap-2 text-base">
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Pague com cartão ou boleto
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
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
            {[
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
                icon: Package,
                title: 'Embalagens e Decorações',
                description: 'Inclua o custo de embalagens, fitas, caixas e decorações no preço final dos produtos.'
              },
              {
                icon: Shield,
                title: 'Margem de Segurança',
                description: 'Adicione uma margem de segurança para cobrir desperdícios e variações de preço.'
              }
            ].map((feature, index) => (
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

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
            <p className="text-lg text-muted-foreground">
              Em 3 passos simples você terá preços precisos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Cadastre seus ingredientes',
                description: 'Adicione os ingredientes com preços de compra. O sistema calcula o custo por unidade.'
              },
              {
                step: '2',
                title: 'Monte suas receitas',
                description: 'Selecione os ingredientes e quantidades. O custo total é calculado automaticamente.'
              },
              {
                step: '3',
                title: 'Defina o preço de venda',
                description: 'Adicione margem de lucro, embalagem e veja o preço final sugerido para seus produtos.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Plano simples e transparente
            </h2>
            <p className="text-lg text-muted-foreground">
              Comece grátis, assine quando quiser
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Mais Popular
              </div>
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-accent" />
                  <CardTitle className="text-2xl">Premium</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">R$ 49,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    14 dias grátis
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {[
                    'Ingredientes, receitas e produtos ilimitados',
                    'Cálculo automático de custos',
                    'Margem de segurança personalizada',
                    'Custos operacionais (gás, energia, mão de obra)',
                    'Gestão de embalagens e decorações',
                    'Categorização completa',
                    'Histórico de preços',
                    'Suporte prioritário'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={onGetStarted} className="w-full gap-2" size="lg">
                  Começar Teste Grátis
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Sem compromisso. Cancele quando quiser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Maria Santos',
                role: 'Confeiteira há 5 anos',
                content: 'Finalmente consegui saber exatamente quanto cobrar pelos meus bolos. O sistema é muito fácil de usar!',
                rating: 5
              },
              {
                name: 'Ana Paula',
                role: 'Dona de confeitaria',
                content: 'Aumentei minha margem de lucro em 30% depois que comecei a usar. Recomendo demais!',
                rating: 5
              },
              {
                name: 'Carla Oliveira',
                role: 'Cake designer',
                content: 'O cálculo de custos operacionais fez toda diferença. Agora sei exatamente onde está meu lucro.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para precificar com precisão?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Junte-se a centenas de confeiteiros que já transformaram seu negócio
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onGetStarted}
            className="gap-2 text-base px-8"
          >
            Começar Teste Grátis de 14 Dias
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Cake className="w-4 h-4 text-accent" />
              </div>
              <span className="font-semibold text-foreground">Confeitaria Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Confeitaria Pro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
