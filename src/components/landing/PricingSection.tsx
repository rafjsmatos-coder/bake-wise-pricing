import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const features = [
    'Ingredientes, receitas e produtos ilimitados',
    'Cálculo automático de custos',
    'Margem de segurança personalizada',
    'Custos operacionais (gás, energia, mão de obra)',
    'Gestão de embalagens e decorações',
    'Categorização completa',
    'Histórico de preços',
    'Suporte prioritário'
  ];

  return (
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
          <Card className="border-accent/30 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              Mais Popular
            </div>
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-accent" />
                <CardTitle className="text-2xl">Premium</CardTitle>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">R$ 49,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Apenas <span className="font-semibold text-foreground">R$ 1,66/dia</span>
                </p>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  14 dias grátis — sem cartão
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Value proposition */}
              <div className="bg-accent/10 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    Se paga com uma única receita bem precificada
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={onGetStarted} className="w-full gap-2 shadow-lg hover:shadow-xl transition-shadow" size="lg">
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
  );
}
