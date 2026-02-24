import dashboardImg from '@/assets/screenshots/dashboard.jpeg';
import productCostImg from '@/assets/screenshots/product-cost.jpeg';
import orderCalendarImg from '@/assets/screenshots/order-calendar.jpeg';
import financialImg from '@/assets/screenshots/financial.jpeg';
import whatsappQuoteImg from '@/assets/screenshots/whatsapp-quote.jpeg';

export function ScreenshotsSection() {
  const screenshots = [
    {
      image: dashboardImg,
      title: 'Dashboard principal',
      description: 'Visão geral do seu negócio com resumo de pedidos, faturamento e alertas.'
    },
    {
      image: productCostImg,
      title: 'Custo e preço do produto',
      description: 'Veja o custo total, preço sugerido e lucro estimado de cada produto.'
    },
    {
      image: orderCalendarImg,
      title: 'Calendário de pedidos',
      description: 'Organize suas encomendas com status e datas de entrega.'
    },
    {
      image: whatsappQuoteImg,
      title: 'Orçamento via WhatsApp',
      description: 'Envie orçamentos profissionais para seus clientes em 1 clique.'
    },
    {
      image: financialImg,
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
          <div className="flex gap-8 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide px-4">
            {screenshots.map((item, index) => (
              <div key={index} className="min-w-[240px] md:min-w-[260px] snap-center flex-shrink-0 flex flex-col items-center">
                {/* Phone mockup */}
                <div className="rounded-[2rem] border-4 border-gray-800 bg-gray-900 shadow-2xl overflow-hidden w-full">
                  {/* Notch */}
                  <div className="bg-gray-900 flex justify-center pt-2 pb-1">
                    <div className="w-20 h-5 bg-gray-800 rounded-full" />
                  </div>
                  {/* Screenshot */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-[9/17] object-cover object-top"
                    loading="lazy"
                  />
                  {/* Bottom bar */}
                  <div className="bg-gray-900 flex justify-center py-2">
                    <div className="w-24 h-1 bg-gray-700 rounded-full" />
                  </div>
                </div>
                {/* Caption */}
                <h3 className="font-semibold text-foreground mt-4 mb-1 text-center">{item.title}</h3>
                <p className="text-sm text-muted-foreground text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
