import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Clock, CheckCircle2, Settings, Calendar, CreditCard } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubscriptionSettings() {
  const { subscription, isLoading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();

  const handleUpgrade = async () => {
    const url = await createCheckout();
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie seu plano e pagamento</p>
      </div>

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Status da Assinatura
                {subscription.status === 'active' && (
                  <Badge className="gap-1 bg-accent/10 text-accent border-accent/20">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                {subscription.status === 'trial' && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Teste Gratuito
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {subscription.status === 'active' && 'Você tem acesso a todas as funcionalidades Premium'}
                {subscription.status === 'trial' && `Aproveite seu período de teste grátis`}
                {subscription.status === 'expired' && 'Seu período de teste expirou'}
                {subscription.status === 'canceled' && 'Sua assinatura foi cancelada'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trial Info */}
          {subscription.status === 'trial' && subscription.trial_end && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Período de teste termina em:</span>
                <span className="font-medium text-accent">
                  {subscription.days_remaining} {subscription.days_remaining === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Termina em {format(new Date(subscription.trial_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Active Subscription Info */}
          {subscription.status === 'active' && subscription.subscription_end && (
            <div className="p-4 bg-accent/5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-accent" />
                <span>Plano Premium - R$ 49,90/mês</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Próxima cobrança: {format(new Date(subscription.subscription_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          )}

          {/* Expired/Canceled Info */}
          {(subscription.status === 'expired' || subscription.status === 'canceled') && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                {subscription.status === 'expired' 
                  ? 'Seu período de teste expirou. Assine o Premium para continuar usando.'
                  : 'Sua assinatura foi cancelada. Reative para voltar a ter acesso.'}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          {(subscription.status === 'trial' || subscription.status === 'expired' || subscription.status === 'canceled') && (
            <Button onClick={handleUpgrade} className="gap-2">
              <Crown className="h-4 w-4" />
              {subscription.status === 'trial' ? 'Assinar Premium' : 'Ativar Premium'}
            </Button>
          )}
          {subscription.status === 'active' && (
            <Button variant="outline" onClick={openCustomerPortal} className="gap-2">
              <Settings className="h-4 w-4" />
              Gerenciar Assinatura
            </Button>
          )}
          <Button variant="ghost" onClick={checkSubscription}>
            Atualizar Status
          </Button>
        </CardFooter>
      </Card>

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            Benefícios Premium
          </CardTitle>
          <CardDescription>
            Tudo que você precisa para gerenciar sua confeitaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Ingredientes, receitas e produtos ilimitados',
              'Cálculo automático de custos',
              'Margem de segurança personalizada',
              'Custos operacionais (gás, energia, mão de obra)',
              'Gestão de embalagens e decorações',
              'Categorização completa',
              'Histórico de preços de ingredientes',
              'Suporte prioritário',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        {subscription.status !== 'active' && (
          <CardFooter>
            <Button onClick={handleUpgrade} className="w-full sm:w-auto gap-2">
              <Crown className="h-4 w-4" />
              Assinar por R$ 49,90/mês
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
