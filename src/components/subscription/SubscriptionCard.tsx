import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { CreditCard, Calendar, Clock, ExternalLink, RefreshCw, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubscriptionCard() {
  const { 
    status, 
    daysRemaining, 
    trialEndsAt, 
    subscriptionEndsAt, 
    startCheckout, 
    openCustomerPortal,
    checkSubscription,
    isLoading 
  } = useSubscription();
  
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsCheckoutLoading(true);
      await startCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsPortalLoading(true);
      await openCustomerPortal();
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Erro ao abrir portal. Tente novamente.');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await checkSubscription();
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Erro ao atualizar status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Premium Ativo</Badge>;
      case 'trial':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Teste Grátis</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Cancelado</Badge>;
      case 'pending':
        return <Badge className="bg-muted text-muted-foreground border-border">Pendente</Badge>;
      default:
        return <Badge variant="outline">Carregando...</Badge>;
    }
  };

  const getExpirationInfo = () => {
    if (status === 'trial' && trialEndsAt) {
      return {
        label: 'Teste expira em',
        date: format(trialEndsAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
        daysText: daysRemaining !== null ? `${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}` : null,
      };
    }
    if (status === 'active' && subscriptionEndsAt) {
      return {
        label: 'Próxima cobrança',
        date: format(subscriptionEndsAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
        daysText: null,
      };
    }
    if ((status === 'expired' || status === 'canceled') && subscriptionEndsAt) {
      return {
        label: 'Expirou em',
        date: format(subscriptionEndsAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
        daysText: null,
      };
    }
    return null;
  };

  const expirationInfo = getExpirationInfo();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-accent" />
            Minha Assinatura
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        {expirationInfo && (
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{expirationInfo.label}</p>
              <p className="font-medium text-foreground">{expirationInfo.date}</p>
              {expirationInfo.daysText && (
                <p className="text-sm text-accent font-medium mt-1">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  {expirationInfo.daysText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Trial / Expired - Show subscribe button */}
        {(status === 'trial' || status === 'expired' || status === 'canceled') && (
          <div className="space-y-3">
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                R$ 49,90
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Acesso completo a todas as ferramentas
              </p>
            </div>
            
            <Button 
              onClick={handleSubscribe}
              disabled={isCheckoutLoading}
              className="w-full gap-2 min-h-[44px]"
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {status === 'trial' ? 'Assinar Agora' : 'Reativar Assinatura'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Active - Show manage button */}
        {status === 'active' && (
          <Button 
            variant="outline"
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
            className="w-full gap-2 min-h-[44px]"
          >
            {isPortalLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Gerenciar Assinatura
              </>
            )}
          </Button>
        )}

        {/* Refresh button - useful for boleto payments */}
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full gap-2 text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Verificar status do pagamento'}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Pagou via boleto? Clique acima para atualizar seu status.
        </p>
      </CardContent>
    </Card>
  );
}
