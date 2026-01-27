import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cake, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onGetStarted();
  };

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Cake className="w-5 h-5 text-accent" />
            </div>
            <span className="font-bold text-xl text-foreground">PreciBake</span>
          </div>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Calcule seus preços com precisão
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Saiba exatamente quanto cobrar —{' '}
            <span className="text-accent">sem adivinhação</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Lucre mais com o mesmo trabalho e tenha segurança ao cobrar seus produtos. 
            Chega de vender barato por não saber calcular.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={handleClick} className="gap-2 text-base px-8 shadow-lg hover:shadow-xl transition-shadow" type="button">
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={handleClick} 
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              Já tenho uma conta
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Fácil de usar
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Cálculos precisos
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Suporte incluso
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
