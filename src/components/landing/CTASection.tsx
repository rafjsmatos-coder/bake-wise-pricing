import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 text-center relative">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Calcule seus preços com precisão</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Chega de vender barato.
        </h2>
        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-xl mx-auto">
          Comece a cobrar o que seu trabalho realmente vale.
        </p>
        
        <Button 
          size="lg" 
          variant="secondary"
          onClick={onGetStarted}
          className="gap-2 text-base px-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
          Começar Agora
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
