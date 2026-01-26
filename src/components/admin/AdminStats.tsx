import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  total: number;
  trial: number;
  active: number;
  expired: number;
  canceled: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: 'stats',
        },
      });

      if (error) {
        toast.error('Erro ao carregar estatísticas');
        console.error(error);
        return;
      }

      setStats(data.stats);
      setMonthlyGrowth(data.monthlyGrowth || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${months[parseInt(m) - 1]}/${year.slice(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Em Trial',
      value: stats?.trial || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Ativos (Pagos)',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Expirados',
      value: stats?.expired || 0,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    className="text-xs"
                  />
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
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
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

      {/* Conversion Rate */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {((stats.active / stats.total) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Trial → Pagante
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">
                  {((stats.trial / stats.total) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Em Trial
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {(((stats.expired + stats.canceled) / stats.total) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Churn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
