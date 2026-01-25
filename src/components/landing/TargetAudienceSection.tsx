import { Badge } from '@/components/ui/badge';
import { 
  Cake,
  Cookie,
  Gift,
  Heart,
  Sparkles
} from 'lucide-react';

export function TargetAudienceSection() {
  const audiences = [
    { icon: Cake, label: 'Confeiteiras' },
    { icon: Cookie, label: 'Doceiras' },
    { icon: Gift, label: 'Boleiras' },
    { icon: Heart, label: 'Cake Designers' },
    { icon: Sparkles, label: 'Vendas sob encomenda' },
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <p className="text-lg font-medium text-foreground">
            Para quem é:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {audiences.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="gap-2 px-4 py-2 text-sm"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
