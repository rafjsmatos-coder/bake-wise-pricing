import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        setMessage('ID da sessão não encontrado');
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        if (!token) {
          setStatus('error');
          setMessage('Sessão expirada. Faça login novamente.');
          return;
        }

        const { data, error } = await supabase.functions.invoke('verify-checkout', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.status === 'pending') {
          setStatus('pending');
          setMessage('Seu boleto foi gerado! Aguardando confirmação do pagamento.');
        } else if (data.success) {
          setStatus('success');
          setMessage('Sua assinatura foi ativada com sucesso!');
          // Refresh subscription state
          await checkSubscription();
        } else {
          setStatus('error');
          setMessage('Não foi possível confirmar o pagamento.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Erro ao verificar pagamento. Tente novamente em alguns minutos.');
      }
    };

    verifyPayment();
  }, [searchParams, checkSubscription]);

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

          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
