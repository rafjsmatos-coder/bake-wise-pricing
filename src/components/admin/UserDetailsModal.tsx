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
import { Loader2, User, CreditCard, Database, Globe, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
  const { session } = useAuth();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && userId && session?.access_token) {
      fetchDetails();
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      trial: { variant: 'secondary', label: 'Trial' },
      active: { variant: 'default', label: 'Ativo' },
      expired: { variant: 'destructive', label: 'Expirado' },
      canceled: { variant: 'outline', label: 'Cancelado' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Assinatura
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
                  <p className="text-sm text-muted-foreground">Status</p>
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

              {details.subscription?.stripe_customer_id && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Stripe</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer ID: </span>
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">
                        {details.subscription.stripe_customer_id}
                      </code>
                    </div>
                    {details.subscription.stripe_subscription_id && (
                      <div>
                        <span className="text-muted-foreground">Subscription ID: </span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">
                          {details.subscription.stripe_subscription_id}
                        </code>
                      </div>
                    )}
                  </div>
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
