import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Eye, EyeOff, Info } from 'lucide-react';
import { ThemeLogo } from '@/components/layout/ThemeLogo';
import { toast } from 'sonner';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePassword, isPasswordValid } from '@/lib/password-validation';
import { PasswordRequirements } from './PasswordRequirements';

interface AuthFormProps {
  onBack?: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthForm({ onBack, defaultTab = 'signin' }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const { signIn, signUp } = useAuth();
  

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Erro ao entrar', {
        description: error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
          : error.message,
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { valid, errors } = validatePassword(password);
    if (!valid) {
      toast.error('Senha não atende os requisitos', {
        description: errors[0],
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast.error('Erro ao processar solicitação', { description: error.message });
    } else {
      toast.success('Cadastro realizado! 📧', {
        description: 'Enviamos um link de confirmação para o seu e-mail. Confira sua caixa de entrada (e a pasta de spam) e clique no link para ativar sua conta.',
        duration: 8000,
      });
    }

    setIsLoading(false);
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in relative">
        <CardHeader className="text-center space-y-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="absolute top-4 left-4 gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          )}
          <div className="mx-auto">
            <ThemeLogo alt="PreciBake - O ponto certo do preço" className="h-20 object-contain mx-auto" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <Alert className="bg-accent/5 border-accent/20">
                  <Info className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-sm">
                    Digite o e-mail e senha que você usou para criar sua conta.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-mail</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="min-h-[44px] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 h-auto text-sm text-accent"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>

                <Button type="submit" className="w-full min-h-[44px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <Alert className="bg-accent/5 border-accent/20">
                  <Info className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-sm">
                    Crie sua conta grátis! Você terá 7 dias para testar todas as funcionalidades.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Como devemos te chamar?</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Ex: Maria Silva"
                    required
                    disabled={isLoading}
                    className="min-h-[44px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Seu nome completo ou como prefere ser chamado(a)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Seu melhor e-mail</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                    className="min-h-[44px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Você usará este e-mail para fazer login
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Crie uma senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      minLength={10}
                      aria-label="Senha"
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="min-h-[44px] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordRequirements password={signupPassword} />
                </div>
                <Button type="submit" className="w-full min-h-[44px]" disabled={isLoading || !isPasswordValid(signupPassword)}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta Grátis'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Ao criar sua conta, você concorda com nossos{' '}
                  <Link to="/termos" className="underline hover:text-foreground transition-colors">Termos de Uso</Link>
                  {' '}e{' '}
                  <Link to="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</Link>.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
