import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Calculator, Calendar, MessageCircle, DollarSign } from 'lucide-react';

export function ScreenshotsSection() {
  const screenshots = [
    {
      icon: Monitor,
      title: 'Dashboard principal',
      description: 'Visão geral do seu negócio com resumo de pedidos, faturamento e alertas.'
    },
    {
      icon: Calculator,
      title: 'Custo e preço do produto',
      description: 'Veja o custo total, preço sugerido e lucro estimado de cada produto.'
    },
    {
      icon: Calendar,
      title: 'Calendário de pedidos',
      description: 'Organize suas encomendas com status e datas de entrega.'
    },
    {
      icon: MessageCircle,
      title: 'Orçamento via WhatsApp',
      description: 'Envie orçamentos profissionais para seus clientes em 1 clique.'
    },
    {
      icon: DollarSign,
      title: 'Controle financeiro',
      description: 'Fluxo de caixa, relatórios e contas a receber organizados.'
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Veja o sistema por dentro
          </h2>
          <p className="text-lg text-muted-foreground">
            Conheça as telas que vão transformar sua confeitaria
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {screenshots.map((item, index) => (
              <Card key={index} className="min-w-[280px] md:min-w-[300px] snap-center border-border/50 flex-shrink-0">
                <CardContent className="p-6">
                  <div className="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center mb-4 border border-dashed border-border">
                    <div className="text-center space-y-2">
                      <item.icon className="w-10 h-10 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs text-muted-foreground/50">Print em breve</p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
