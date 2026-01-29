import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { toast } from 'sonner';

export function TrialBanner() {
  const { status, daysRemaining, startCheckout } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show for trial users
  if (status !== 'trial' || isDismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await startCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const daysText = daysRemaining === 1 ? '1 dia' : `${daysRemaining} dias`;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3;

  return (
    <div className={`
      flex items-center justify-between gap-4 px-4 py-2.5 text-sm
      ${isUrgent 
        ? 'bg-destructive/10 border-b border-destructive/20' 
        : 'bg-accent/10 border-b border-accent/20'
      }
    `}>
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-destructive' : 'text-accent'}`} />
        <span className="text-foreground">
          {isUrgent ? (
            <strong>Restam apenas {daysText} do seu teste grátis!</strong>
          ) : (
            <>Restam <strong>{daysText}</strong> do seu teste grátis</>
          )}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant={isUrgent ? "destructive" : "default"}
          size="sm"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Assinar por R$ 49,90'}
        </Button>
        <button 
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-background/50 rounded"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
