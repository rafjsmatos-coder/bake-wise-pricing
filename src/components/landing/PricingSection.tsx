import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Barcode,
  Flame
} from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const features = [
    '7 dias grátis para testar tudo',
    'Ingredientes, receitas e produtos ilimitados',
    'Cálculo automático de custos',
    'Margem de segurança personalizada',
    'Custos operacionais (gás, energia, mão de obra)',
    'Gestão de embalagens e decorações',
    'Gestão de pedidos e calendário',
    'Controle financeiro completo',
    'Orçamento via WhatsApp',
    'Suporte prioritário'
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preço de lançamento por tempo limitado
          </h2>
          <p className="text-lg text-muted-foreground">
            Quem assinar agora garante esse valor para sempre
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-accent/30 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-bl-lg flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              PREÇO DE LANÇAMENTO
            </div>
            
            <CardHeader className="text-center pb-2 pt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-accent" />
                <CardTitle className="text-2xl">PreciBake Premium</CardTitle>
              </div>
              <div className="mt-4">
                <span className="text-xl text-muted-foreground line-through mr-2">R$ 79,90</span>
                <span className="text-4xl font-bold">R$ 49,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-accent font-medium mt-2">
                Preço promocional por tempo limitado
              </p>
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
                Começar Teste Grátis
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão</span>
                </div>
                <div className="flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Boleto</span>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                Cancele quando quiser. Sem compromisso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
