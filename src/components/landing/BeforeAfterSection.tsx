import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

export function BeforeAfterSection() {
  const beforeItems = [
    'Anota preços no caderno ou planilha',
    'Esquece custos como gás, luz e embalagem',
    'Cobra "no olho" e torce pra dar lucro',
    'Perde tempo montando orçamento no WhatsApp',
    'Não sabe se o pedido deu lucro ou prejuízo',
  ];

  const afterItems = [
    'Custo calculado automaticamente com todos os gastos',
    'Preço de venda sugerido com margem real',
    'Orçamento profissional enviado em 1 clique',
    'Calendário de pedidos organizado com status',
    'Lucro real visível em cada encomenda',
  ];

  return (
    <section id="antes-depois" aria-label="Antes e depois do PreciBake" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Antes vs Depois do PreciBake
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja a transformação na rotina da sua confeitaria
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Before card */}
          <Card className="border-destructive/20 bg-destructive/5 h-full">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-destructive">Sem PreciBake</h3>
              </div>
              <div className="space-y-4">
                {beforeItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* After card */}
          <Card className="border-accent/30 bg-accent/5 h-full">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-accent">Com PreciBake</h3>
              </div>
              <div className="space-y-4">
                {afterItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
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
