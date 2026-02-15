import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';
import precibakeIcon from '@/assets/precibake-icon.jpeg';

export function ExampleSection() {
  const examples = [
    {
      name: 'Red Velvet 1kg',
      cost: 28.40,
      price: 65.90,
      profit: 37.50,
      margin: 132
    },
    {
      name: 'Brigadeiros (100un)',
      cost: 45.60,
      price: 120.00,
      profit: 74.40,
      margin: 163
    },
    {
      name: 'Naked Cake',
      cost: 52.30,
      price: 145.00,
      profit: 92.70,
      margin: 177
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Exemplo Real</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Veja como funciona na prática
          </h2>
          <p className="text-lg text-muted-foreground">
            O sistema calcula tudo automaticamente para você
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {examples.map((example, index) => (
            <Card key={index} className="border-accent/20 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <img src={precibakeIcon} alt="PreciBake" className="w-5 h-5 rounded object-cover" />
                  <CardTitle className="text-lg">{example.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo total:</span>
                  <span className="font-medium">R$ {example.cost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Preço sugerido:</span>
                  <span className="font-bold text-accent">R$ {example.price.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Lucro estimado:</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="font-bold text-accent">R$ {example.profit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
