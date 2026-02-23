import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Boleira de casamentos',
      city: 'São Paulo, SP',
      niche: 'Bolos decorados',
      content: 'Aumentei minha margem em 35% depois que parei de precificar no olho. Agora sei exatamente quanto cobrar.',
      result: '+35% de margem',
      rating: 5
    },
    {
      name: 'Ana Paula',
      role: 'Doceira de encomendas',
      city: 'Belo Horizonte, MG',
      niche: 'Doces finos',
      content: 'Descobri que estava vendendo brigadeiros quase no prejuízo. Hoje meu lucro é real e consistente.',
      result: '+R$ 800/mês',
      rating: 5
    },
    {
      name: 'Carla Oliveira',
      role: 'Confeiteira caseira',
      city: 'Curitiba, PR',
      niche: 'Naked cakes',
      content: 'O cálculo de custos operacionais fez toda diferença. Finalmente entendi onde estava meu lucro.',
      result: '+42% de lucro',
      rating: 5
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Resultados que confeiteiras estão alcançando
          </h2>
          <p className="text-lg text-muted-foreground">
            Exemplos de resultados esperados com precificação correta
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    {testimonial.result}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {testimonial.niche}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          * Resultados esperados baseados em precificação correta. Resultados individuais podem variar.
        </p>
      </div>
    </section>
  );
}
