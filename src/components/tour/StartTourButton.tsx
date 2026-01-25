import { useTour } from '@reactour/tour';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface StartTourButtonProps {
  variant?: 'default' | 'card';
}

export function StartTourButton({ variant = 'default' }: StartTourButtonProps) {
  const { setIsOpen } = useTour();

  if (variant === 'card') {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2 border-dashed"
      >
        <HelpCircle className="h-4 w-4" />
        Tour Guiado
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => setIsOpen(true)}
      variant="ghost"
      size="sm"
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Tour Guiado</span>
    </Button>
  );
}
