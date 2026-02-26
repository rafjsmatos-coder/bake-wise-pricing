import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { ThemeLogo } from '@/components/layout/ThemeLogo';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use custom edge function to send PT-BR recovery email via Resend
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          action: 'recovery',
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
    } catch (error: any) {
      toast.error('Erro ao enviar e-mail', {
        description: 'Verifique se o e-mail está correto e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">E-mail Enviado!</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Próximos passos:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Abra sua caixa de entrada</li>
                  <li>Procure o e-mail de "PreciBake"</li>
                  <li>Clique no link para criar uma nova senha</li>
                  <li>Se não encontrar, verifique a pasta de spam</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={() => setEmailSent(false)}
              >
                Não recebeu? Enviar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute top-4 left-4 gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="mx-auto">
            <ThemeLogo className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Não se preocupe! Digite seu e-mail e enviaremos um link para você criar uma nova senha.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail cadastrado</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">
                Digite o mesmo e-mail que você usou para criar sua conta
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
