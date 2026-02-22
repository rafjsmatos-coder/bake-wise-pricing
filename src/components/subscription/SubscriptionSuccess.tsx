import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [retrying, setRetrying] = useState(false);

  const verifyPayment = useCallback(async () => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setMessage('ID da sessão não encontrado');
      return;
    }

    setStatus('loading');
    setMessage('');

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[SubscriptionSuccess] Attempt ${attempt}/${MAX_RETRIES}`);

        // Chamar verify-checkout SEM autenticação (usa metadata do Stripe)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        if (data.status === 'pending') {
          setStatus('pending');
          setMessage('Seu boleto foi gerado! Aguardando confirmação do pagamento.');
          // Tentar atualizar estado de subscription se sessão existir
          try { await checkSubscription(); } catch {}
          return;
        } else if (data.success) {
          setStatus('success');
          setMessage('Sua assinatura foi ativada com sucesso!');
          // Refresh subscription state
          try { await checkSubscription(); } catch {}
          return;
        } else {
          throw new Error('Resposta inesperada do servidor');
        }
      } catch (error) {
        console.error(`[SubscriptionSuccess] Attempt ${attempt} failed:`, error);
        
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        } else {
          setStatus('error');
          setMessage('Erro ao verificar pagamento. Use o botão abaixo para tentar novamente.');
        }
      }
    }
  }, [searchParams, checkSubscription]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const handleRetry = async () => {
    setRetrying(true);
    await verifyPayment();
    setRetrying(false);
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-accent animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case 'pending':
        return <Clock className="w-12 h-12 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verificando pagamento...';
      case 'success':
        return 'Pagamento confirmado!';
      case 'pending':
        return 'Pagamento pendente';
      case 'error':
        return 'Erro na verificação';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-green-700 dark:text-green-300">
              <p className="font-medium">Bem-vindo ao PreciBake Premium!</p>
              <p className="text-sm mt-1">Agora você tem acesso completo a todas as ferramentas.</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-yellow-700 dark:text-yellow-300">
              <p className="text-sm">
                Assim que o pagamento for confirmado, sua assinatura será ativada automaticamente.
                Isso pode levar até 1 dia útil.
              </p>
            </div>
          )}

          {status === 'error' && (
            <Button onClick={handleRetry} variant="outline" disabled={retrying} className="w-full">
              {retrying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tentar Novamente
            </Button>
          )}

          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
