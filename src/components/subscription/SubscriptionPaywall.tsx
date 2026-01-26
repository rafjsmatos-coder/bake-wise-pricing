import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Clock, CheckCircle2, AlertTriangle, X, LogOut } from 'lucide-react';
import { prepareExternalNavigation } from '@/lib/open-external';

export function SubscriptionPaywall() {
  const { subscription, isLoading, createCheckout, canAccessApp, sessionError } = useSubscription();
  const { signOut } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // Prepare navigation BEFORE the async call (to avoid popup blocking)
    const navigate = prepareExternalNavigation();
    
    try {
      const url = await createCheckout();
      navigate(url);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (canAccessApp && !sessionError) {
    return null;
  }

  // Show session error state with sign out option
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Sessão expirada</CardTitle>
            <CardDescription className="text-base">
              Sua sessão expirou ou há um problema de autenticação. Por favor, faça login novamente para continuar.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleSignOut} 
              className="w-full" 
              size="lg"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair e entrar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            {subscription.status === 'expired' ? (
              <Clock className="h-8 w-8 text-destructive" />
            ) : subscription.status === 'canceled' ? (
              <X className="h-8 w-8 text-destructive" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {subscription.status === 'expired' && 'Seu período de teste expirou'}
            {subscription.status === 'canceled' && 'Assinatura cancelada'}
            {subscription.status === 'past_due' && 'Pagamento pendente'}
          </CardTitle>
          <CardDescription className="text-base">
            {subscription.status === 'expired' && 
              'Seu trial de 14 dias chegou ao fim. Assine o plano Premium para continuar usando todas as funcionalidades.'}
            {subscription.status === 'canceled' && 
              'Sua assinatura foi cancelada. Renove para voltar a ter acesso completo.'}
            {subscription.status === 'past_due' && 
              'Houve um problema com seu pagamento. Atualize seu método de pagamento.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Premium Plan Card */}
          <div className="border-2 border-accent rounded-xl p-6 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Recomendado
            </Badge>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Confeitaria Master Premium</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">R$ 49,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                'Ingredientes, receitas e produtos ilimitados',
                'Cálculo automático de custos',
                'Margem de segurança personalizada',
                'Custos operacionais (gás, energia, mão de obra)',
                'Gestão de embalagens e decorações',
                'Categorização completa',
                'Suporte prioritário',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleUpgrade} 
            className="w-full" 
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Crown className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Abrindo checkout...' : 'Assinar Premium'}
          </Button>
          <Button 
            onClick={handleSignOut} 
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair e usar outra conta
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Cancele a qualquer momento. Pagamento seguro via Stripe.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
