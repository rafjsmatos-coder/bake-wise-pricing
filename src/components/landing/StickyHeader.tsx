import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  onGetStarted: () => void;
}

export function StickyHeader({ onGetStarted }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Cake className="w-4 h-4 text-accent" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">PreciBake</span>
          </div>
          <Button onClick={onGetStarted} size="sm" className="gap-2 shadow-md">
            Teste Grátis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
