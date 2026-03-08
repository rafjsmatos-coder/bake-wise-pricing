import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, CreditCard, Clock, Crown, XCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';

interface Stats {
  total: number;
  subscriptions?: {
    trial: number;
    active: number;
    expired: number;
    canceled: number;
    pending: number;
  };
  conversionRate?: number;
  churnRate?: number;
  retention?: { last7Days: number; last30Days: number };
  funnel?: { stage: string; value: number }[];
}

interface MonthlyData {
  month: string;
  count: number;
}

const FUNNEL_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function AdminStats() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'stats' },
      });
      if (error) { toast.error('Erro ao carregar estatísticas'); return; }
      setStats(data.stats);
      setMonthlyGrowth(data.monthlyGrowth || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${months[parseInt(m) - 1]}/${year.slice(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Total + Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats?.conversionRate ?? 0}%</p>
                <p className="text-xs text-muted-foreground">Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.churnRate ?? 0}%</p>
                <p className="text-xs text-muted-foreground">Churn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.retention?.last7Days ?? 0}</p>
                <p className="text-xs text-muted-foreground">Ativos (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Stats */}
      {stats?.subscriptions && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.subscriptions.trial}</p>
                  <p className="text-xs text-muted-foreground">Em Trial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10">
                  <Crown className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.subscriptions.active}</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.subscriptions.expired}</p>
                  <p className="text-xs text-muted-foreground">Expirados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.subscriptions.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.subscriptions.canceled}</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retention Card */}
      {stats?.retention && (
        <Card>
          <CardHeader>
            <CardTitle>Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{stats.retention.last7Days}</p>
                <p className="text-sm text-muted-foreground mt-1">Ativos nos últimos 7 dias</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.retention.last7Days / stats.total) * 100) : 0}% do total
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{stats.retention.last30Days}</p>
                <p className="text-sm text-muted-foreground mt-1">Ativos nos últimos 30 dias</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.retention.last30Days / stats.total) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Chart */}
      {stats?.funnel && stats.funnel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} usuários`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Funnel dataKey="value" data={stats.funnel} isAnimationActive>
                    {stats.funnel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                    ))}
                    <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="stage" />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Novos Usuários por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyGrowth.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    labelFormatter={formatMonth}
                    formatter={(value: number) => [`${value} usuários`, 'Novos']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível para exibir
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
