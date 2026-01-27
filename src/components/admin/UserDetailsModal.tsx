import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User, CreditCard, Database, Globe, Phone, MapPin, Instagram, Facebook, MessageCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface UserDetails {
  user: {
    id: string;
    email: string;
    createdAt: string;
    lastSignIn: string | null;
  };
  profile: {
    full_name: string | null;
    business_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    instagram: string | null;
    facebook: string | null;
    website: string | null;
    avatar_url: string | null;
  } | null;
  subscription: {
    status: string;
    trial_start: string;
    trial_end: string;
    subscription_start: string | null;
    subscription_end: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    stripe_product_id: string | null;
  } | null;
  roles: string[];
  dataCounts: {
    ingredients: number;
    recipes: number;
    products: number;
    packaging: number;
    decorations: number;
  };
}

interface StripeInfo {
  customer: {
    id: string;
    email: string;
    created: number;
    name: string | null;
  } | null;
  subscriptions: Array<{
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    plan: {
      id: string;
      product: string;
      amount: number;
      currency: string;
      interval: string;
    } | null;
  }>;
  invoices: Array<{
    id: string;
    status: string;
    amount_paid: number;
    currency: string;
    created: number;
    hosted_invoice_url: string | null;
  }>;
  error?: string;
}

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  const { session } = useAuth();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [stripeInfo, setStripeInfo] = useState<StripeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (open && userId && session?.access_token) {
      fetchDetails();
      setStripeInfo(null);
    }
  }, [open, userId, session?.access_token]);

  const fetchDetails = async () => {
    if (!userId || !session?.access_token) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'getUserDetails',
          userId,
        },
      });

      if (error) {
        console.error('Error fetching user details:', error);
        return;
      }

      setDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeInfo = async () => {
    if (!details || !session?.access_token) return;

    setIsLoadingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'getStripeInfo',
          email: details.user.email,
          stripeCustomerId: details.subscription?.stripe_customer_id,
        },
      });

      if (error) {
        console.error('Error fetching Stripe info:', error);
        toast.error('Erro ao buscar dados do Stripe');
        return;
      }

      setStripeInfo(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar dados do Stripe');
    } finally {
      setIsLoadingStripe(false);
    }
  };

  const syncFromStripe = async () => {
    if (!details || !session?.access_token) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'syncFromStripe',
          userId: details.user.id,
          email: details.user.email,
          stripeCustomerId: details.subscription?.stripe_customer_id,
        },
      });

      if (error) {
        console.error('Error syncing from Stripe:', error);
        toast.error('Erro ao sincronizar do Stripe');
        return;
      }

      toast.success('Sincronizado com sucesso!');
      fetchDetails();
      fetchStripeInfo();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao sincronizar do Stripe');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      trial: { variant: 'secondary', label: 'Trial' },
      active: { variant: 'default', label: 'Ativo' },
      expired: { variant: 'destructive', label: 'Expirado' },
      canceled: { variant: 'outline', label: 'Cancelado' },
      trialing: { variant: 'secondary', label: 'Trial' },
      past_due: { variant: 'destructive', label: 'Pagamento Pendente' },
      incomplete: { variant: 'outline', label: 'Incompleto' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp * 1000), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : details ? (
          <Tabs defaultValue="profile" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Assinatura
              </TabsTrigger>
              <TabsTrigger value="stripe" onClick={fetchStripeInfo}>
                <CreditCard className="h-4 w-4 mr-2" />
                Stripe
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-4 w-4 mr-2" />
                Dados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{details.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{details.profile?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negócio</p>
                  <p className="font-medium">{details.profile?.business_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roles</p>
                  <div className="flex gap-1">
                    {details.roles.length > 0 ? (
                      details.roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">user</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Contato</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{details.profile?.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{details.profile?.whatsapp || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Endereço</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    {details.profile?.address && <p>{details.profile.address}</p>}
                    {(details.profile?.city || details.profile?.state) && (
                      <p>{[details.profile?.city, details.profile?.state].filter(Boolean).join(' - ')}</p>
                    )}
                    {details.profile?.zip_code && <p>CEP: {details.profile.zip_code}</p>}
                    {!details.profile?.address && !details.profile?.city && '-'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Redes Sociais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <span>{details.profile?.instagram || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <span>{details.profile?.facebook || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{details.profile?.website || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Atividade</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastro</p>
                    <p className="font-medium">{formatDate(details.user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último acesso</p>
                    <p className="font-medium">{formatDate(details.user.lastSignIn)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status (Banco)</p>
                  <div className="mt-1">
                    {details.subscription ? getStatusBadge(details.subscription.status) : '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Início do Trial</p>
                  <p className="font-medium">{formatDate(details.subscription?.trial_start || null)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fim do Trial</p>
                  <p className="font-medium">{formatDate(details.subscription?.trial_end || null)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Início Assinatura</p>
                  <p className="font-medium">{formatDate(details.subscription?.subscription_start || null)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fim Assinatura</p>
                  <p className="font-medium">{formatDate(details.subscription?.subscription_end || null)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">IDs do Stripe (no banco)</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer ID: </span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">
                      {details.subscription?.stripe_customer_id || 'Não definido'}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subscription ID: </span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">
                      {details.subscription?.stripe_subscription_id || 'Não definido'}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Product ID: </span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">
                      {details.subscription?.stripe_product_id || 'Não definido'}
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stripe" className="space-y-4 mt-4">
              {isLoadingStripe ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  <span className="ml-2">Carregando dados do Stripe...</span>
                </div>
              ) : stripeInfo ? (
                <>
                  {stripeInfo.error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                      {stripeInfo.error}
                    </div>
                  )}

                  {stripeInfo.customer ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer ID</p>
                          <code className="bg-muted px-2 py-0.5 rounded text-xs">
                            {stripeInfo.customer.id}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email no Stripe</p>
                          <p className="font-medium">{stripeInfo.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nome no Stripe</p>
                          <p className="font-medium">{stripeInfo.customer.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cliente desde</p>
                          <p className="font-medium">{formatTimestamp(stripeInfo.customer.created)}</p>
                        </div>
                      </div>

                      {stripeInfo.subscriptions.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Assinaturas no Stripe</h4>
                          <div className="space-y-3">
                            {stripeInfo.subscriptions.map((sub) => (
                              <div key={sub.id} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <code className="text-xs">{sub.id}</code>
                                  {getStatusBadge(sub.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Período: </span>
                                    {formatTimestamp(sub.current_period_start)} - {formatTimestamp(sub.current_period_end)}
                                  </div>
                                  {sub.plan && (
                                    <div>
                                      <span className="text-muted-foreground">Valor: </span>
                                      {formatCurrency(sub.plan.amount, sub.plan.currency)}/{sub.plan.interval}
                                    </div>
                                  )}
                                  {sub.cancel_at_period_end && (
                                    <div className="col-span-2 text-destructive">
                                      ⚠️ Cancelamento agendado para o fim do período
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stripeInfo.invoices.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Últimos Pagamentos</h4>
                          <div className="space-y-2">
                            {stripeInfo.invoices.map((inv) => (
                              <div key={inv.id} className="flex items-center justify-between text-sm bg-muted/30 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <span>{formatTimestamp(inv.created)}</span>
                                  <span className="font-medium">
                                    {formatCurrency(inv.amount_paid, inv.currency)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(inv.status || 'unknown')}
                                  {inv.hosted_invoice_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={() => window.open(inv.hosted_invoice_url!, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/customers/${stripeInfo.customer!.id}`, '_blank')}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Abrir no Stripe
                        </Button>
                        <Button
                          onClick={syncFromStripe}
                          disabled={isSyncing}
                          className="gap-2"
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Sincronizar para o Banco
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Cliente não encontrado no Stripe.</p>
                      <p className="text-sm mt-1">O usuário ainda não realizou nenhum pagamento.</p>
                      <Button onClick={fetchStripeInfo} variant="outline" className="gap-2 mt-4">
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Clique para buscar dados em tempo real do Stripe.</p>
                  <Button onClick={fetchStripeInfo} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Carregar dados do Stripe
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="data" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{details.dataCounts.ingredients}</p>
                  <p className="text-sm text-muted-foreground">Ingredientes</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{details.dataCounts.recipes}</p>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{details.dataCounts.products}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{details.dataCounts.packaging}</p>
                  <p className="text-sm text-muted-foreground">Embalagens</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{details.dataCounts.decorations}</p>
                  <p className="text-sm text-muted-foreground">Decorações</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">
                    {details.dataCounts.ingredients +
                      details.dataCounts.recipes +
                      details.dataCounts.products +
                      details.dataCounts.packaging +
                      details.dataCounts.decorations}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Não foi possível carregar os detalhes do usuário.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
