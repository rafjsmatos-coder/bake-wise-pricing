import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-20 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-accent/30 bg-background shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Com precificação correta, sua margem aumenta entre{' '}
                  <span className="text-accent">20% e 40%</span>
                </h2>
                
                <p className="text-lg text-muted-foreground">
                  Sem precisar vender mais. Apenas cobrando o preço certo.
                </p>

                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span>Custo calculado automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Zap className="w-5 h-5 text-accent" />
                    <span>Preço de venda sugerido</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>Lucro estimado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
