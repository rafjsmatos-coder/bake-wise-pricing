import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import precibakeLogo from '@/assets/precibake-logo.jpeg';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  onGetStarted: () => void;
}

export function StickyHeader({ onGetStarted }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onGetStarted();
  };

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
            <img src={precibakeLogo} alt="PreciBake" className="h-8 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleClick} size="sm" className="gap-2 shadow-md" type="button">
              Começar Agora
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClick}
              className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              type="button"
            >
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
