import { Card, CardContent } from '@/components/ui/card';
import { X, AlertTriangle, TrendingDown } from 'lucide-react';

export function PainPointsSection() {
  const painPoints = [
    'Precifica "no olho" sem cálculo real',
    'Só conta os ingredientes principais',
    'Esquece de incluir gás e energia',
    'Não considera a mão de obra',
    'Não sabe calcular margem de lucro',
  ];

  return (
    <section id="problemas" aria-label="Problemas comuns na precificação de doces" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Você ainda precifica no olho?
            </h2>
            <div className="inline-flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">A maioria das confeiteiras precifica assim:</span>
            </div>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {painPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-destructive/20">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <p className="text-lg font-semibold text-destructive">
                  Resultado: vende muito, lucra pouco.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
