import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight,
  CheckCircle2,
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
            Tudo que você precisa
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas completas para precificar seus produtos
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-accent/30 relative overflow-hidden shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-accent" />
                <CardTitle className="text-2xl">Recursos Inclusos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={onGetStarted} className="w-full gap-2 shadow-lg hover:shadow-xl transition-shadow" size="lg">
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
