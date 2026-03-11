import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ThemeLogo } from '@/components/layout/ThemeLogo';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function HeroSection({ onGetStarted, onLogin }: HeroSectionProps) {
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
            <ThemeLogo className="h-10 object-contain" />
          </div>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Precificação Inteligente
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
              Gestão de Pedidos
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
              Controle Financeiro
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Calcule o preço certo dos seus bolos e doces —{' '}
            <span className="text-accent">pare de vender barato</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            O app para confeiteira que vende sob encomenda e precisa saber exatamente quanto cobrar. 
            Precificação automática, sistema de pedidos, estoque e finanças — tudo no celular.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={handleClick} className="gap-2 text-base px-8 shadow-lg hover:shadow-xl transition-shadow" type="button">
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={onLogin} 
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              Já tenho uma conta
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Funciona no celular
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Orçamento via WhatsApp
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
