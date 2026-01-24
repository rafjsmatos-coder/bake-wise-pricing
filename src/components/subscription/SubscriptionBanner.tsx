import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubscriptionBanner() {
  const { subscription, createCheckout, openCustomerPortal } = useSubscription();

  const handleUpgrade = async () => {
    const url = await createCheckout();
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (subscription.status === 'loading') {
    return null;
  }

  if (subscription.status === 'trial') {
    const daysText = subscription.days_remaining === 1 
      ? '1 dia restante' 
      : `${subscription.days_remaining} dias restantes`;
    
    const isUrgent = (subscription.days_remaining || 0) <= 3;

    return (
      <div className={`px-4 py-2 flex items-center justify-between ${
        isUrgent ? 'bg-destructive/10' : 'bg-accent/10'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${isUrgent ? 'text-destructive' : 'text-accent'}`} />
          <span className="text-sm font-medium">
            Período de teste: <span className={isUrgent ? 'text-destructive' : 'text-accent'}>{daysText}</span>
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleUpgrade}
          className="gap-1"
        >
          <Crown className="h-3 w-3" />
          Assinar Premium
        </Button>
      </div>
    );
  }

  if (subscription.status === 'active') {
    return (
      <div className="px-4 py-2 flex items-center justify-between bg-accent/5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
          {subscription.subscription_end && (
            <span className="text-sm text-muted-foreground">
              Renova {formatDistanceToNow(new Date(subscription.subscription_end), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={openCustomerPortal}
          className="gap-1"
        >
          <Settings className="h-3 w-3" />
          Gerenciar
        </Button>
      </div>
    );
  }

  return null;
}
