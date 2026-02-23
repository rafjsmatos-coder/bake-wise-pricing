import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle2 } from 'lucide-react';

export function ComparisonSection() {
  const comparisons = [
    { pain: 'Esquece de incluir gás e energia', solution: 'Calcula tudo automaticamente' },
    { pain: 'Demora para montar orçamento', solution: 'Orçamento pronto em 1 clique' },
    { pain: 'Não controla pedidos', solution: 'Calendário com status de cada pedido' },
    { pain: 'Sem controle financeiro', solution: 'Fluxo de caixa e relatórios' },
    { pain: 'Perde tempo atualizando preços', solution: 'Preços atualizados em tempo real' },
    { pain: 'Não sabe o lucro real', solution: 'Lucro estimado por produto' },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planilha vs PreciBake
          </h2>
          <p className="text-lg text-muted-foreground">
            Pare de perder tempo e dinheiro com planilhas
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Planilha column */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-destructive mb-6 text-center">
                📋 Planilha / Calculando na mão
              </h3>
              <div className="space-y-4">
                {comparisons.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-foreground text-sm">{item.pain}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PreciBake column */}
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-accent mb-6 text-center">
                ✨ PreciBake
              </h3>
              <div className="space-y-4">
                {comparisons.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item.solution}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
