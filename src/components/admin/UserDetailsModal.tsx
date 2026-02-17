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
import { Loader2, User, Database, Globe, Phone, MapPin, Instagram, Facebook, MessageCircle, CreditCard, ShieldCheck, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionLog {
  id: string;
  admin_user_id: string;
  target_user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

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
  roles: string[];
  subscription: {
    status: string;
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    manual_override: boolean;
    created_at: string;
  } | null;
  dataCounts: {
    ingredients: number;
    recipes: number;
    products: number;
    packaging: number;
    decorations: number;
    orders: number;
    clients: number;
  };
  actionLogs: ActionLog[];
}

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_LABELS: Record<string, string> = {
  extendTrial: 'Extensão de Trial',
  updateSubscription: 'Atualização de Assinatura',
  syncFromStripe: 'Sincronização Stripe',
  toggleAdmin: 'Alteração de Permissão',
  deleteUser: 'Exclusão de Usuário',
};

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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getActionDetails = (log: ActionLog): string => {
    const d = log.details;
    switch (log.action) {
      case 'extendTrial':
        return `+${d.days} dias`;
      case 'updateSubscription':
        if (d.status) return `Status → ${d.status}${d.daysToAdd ? ` (${d.daysToAdd}d)` : ''}`;
        if (d.manualOverride === false) return 'Override removido';
        return JSON.stringify(d);
      case 'syncFromStripe':
        return String(d.result || d.message || '');
      case 'toggleAdmin':
        return d.makeAdmin ? 'Promovido a admin' : 'Removido de admin';
      case 'deleteUser':
        return 'Usuário deletado';
      default:
        return JSON.stringify(d);
    }
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
              <TabsTrigger value="data">
                <Database className="h-4 w-4 mr-2" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Histórico
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
              {details.subscription ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={
                        details.subscription.status === 'active' ? 'default' :
                        details.subscription.status === 'trial' ? 'secondary' :
                        'destructive'
                      } className="mt-1">
                        {details.subscription.status === 'active' ? 'Premium' :
                         details.subscription.status === 'trial' ? 'Trial' :
                         details.subscription.status === 'pending' ? 'Pendente' :
                         details.subscription.status === 'canceled' ? 'Cancelado' : 'Expirado'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Override Manual</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck className={`h-4 w-4 ${details.subscription.manual_override ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{details.subscription.manual_override ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Datas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fim do Trial</p>
                        <p className="font-medium">{formatDate(details.subscription.trial_ends_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fim da Assinatura</p>
                        <p className="font-medium">{formatDate(details.subscription.subscription_ends_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Criada em</p>
                        <p className="font-medium">{formatDate(details.subscription.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {(details.subscription.stripe_customer_id || details.subscription.stripe_subscription_id) && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Stripe</h4>
                      <div className="space-y-2">
                        {details.subscription.stripe_customer_id && (
                          <div>
                            <p className="text-sm text-muted-foreground">Customer ID</p>
                            <p className="font-mono text-sm">{details.subscription.stripe_customer_id}</p>
                          </div>
                        )}
                        {details.subscription.stripe_subscription_id && (
                          <div>
                            <p className="text-sm text-muted-foreground">Subscription ID</p>
                            <p className="font-mono text-sm">{details.subscription.stripe_subscription_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma assinatura encontrada
                </div>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.orders}</p>
                  <p className="text-sm text-muted-foreground">Pedidos</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.clients}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.ingredients}</p>
                  <p className="text-sm text-muted-foreground">Ingredientes</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.recipes}</p>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.products}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.packaging}</p>
                  <p className="text-sm text-muted-foreground">Embalagens</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{details.dataCounts.decorations}</p>
                  <p className="text-sm text-muted-foreground">Decorações</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {details.actionLogs && details.actionLogs.length > 0 ? (
                <div className="space-y-3">
                  {details.actionLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="bg-muted/50 rounded-full p-2 mt-0.5">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {ACTION_LABELS[log.action] || log.action}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getActionDetails(log)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma ação registrada
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum detalhe encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
