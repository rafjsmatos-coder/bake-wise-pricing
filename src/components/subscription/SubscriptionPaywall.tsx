import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CreditCard, Barcode, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePromoStatus } from '@/hooks/usePromoStatus';
import { useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionPaywall() {
  const { startCheckout, status } = useSubscription();
  const { isActive, slotsRemaining, isLoading: promoLoading } = usePromoStatus();
  const [isLoading, setIsLoading] = useState(false);

  const isExpiredPremium = status === 'expired' || status === 'canceled';
  const title = isExpiredPremium 
    ? 'Sua assinatura expirou' 
    : 'Seu período de teste expirou';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-xl border-accent/20">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Continue usando todas as ferramentas do PreciBake para precificar seus produtos com precisão.
          </p>
          
          {isActive && !promoLoading ? (
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-sm font-semibold px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Restam {slotsRemaining} de 25 vagas
              </div>
              <p className="text-3xl font-bold text-accent">
                R$ 29,90
                <span className="text-base font-normal text-muted-foreground">/1º mês</span>
              </p>
              <p className="text-sm text-muted-foreground line-through">
                R$ 49,90/mês
              </p>
              <p className="text-sm text-muted-foreground">
                Depois R$ 49,90/mês · Cancele quando quiser
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-3xl font-bold text-foreground">
                R$ 49,90
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Cancele quando quiser
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? 'Carregando...' : 'Assinar Agora'}
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cartão</span>
              </div>
              <div className="flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5" />
                <span>Boleto</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Pagamento seguro via Stripe. Seus dados estão protegidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
