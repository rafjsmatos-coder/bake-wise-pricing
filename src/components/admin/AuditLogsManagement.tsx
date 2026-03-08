import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, ChevronLeft, ChevronRight, Download, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  admin_user_id: string;
  target_user_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_name: string | null;
  admin_email: string | null;
  target_name: string | null;
  target_email: string | null;
}

const actionLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  toggleAdmin: { label: 'Alterar Admin', variant: 'secondary' },
  updateSubscription: { label: 'Alterar Assinatura', variant: 'default' },
  extendTrial: { label: 'Estender Trial', variant: 'outline' },
  syncFromStripe: { label: 'Sincronizar Stripe', variant: 'outline' },
  deleteUser: { label: 'Excluir Usuário', variant: 'destructive' },
};

export function AuditLogsManagement() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const perPage = 20;

  const fetchLogs = useCallback(async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          action: 'listLogs',
          page,
          perPage,
          actionFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: searchQuery || undefined,
        },
      });
      if (error) throw error;
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar logs');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, page, actionFilter, dateFrom, dateTo, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / perPage);

  const getActionBadge = (action: string) => {
    const config = actionLabels[action] || { label: action, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details || Object.keys(details).length === 0) return '—';
    return Object.entries(details)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Data', 'Ação', 'Admin', 'Usuário Afetado', 'Detalhes'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm'),
      actionLabels[log.action]?.label || log.action,
      log.admin_email || log.admin_user_id,
      log.target_email || log.target_user_id,
      formatDetails(log.details),
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = searchQuery || actionFilter !== 'all' || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">Histórico de todas as ações administrativas</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={logs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="toggleAdmin">Alterar Admin</SelectItem>
              <SelectItem value="updateSubscription">Alterar Assinatura</SelectItem>
              <SelectItem value="extendTrial">Estender Trial</SelectItem>
              <SelectItem value="syncFromStripe">Sincronizar Stripe</SelectItem>
              <SelectItem value="deleteUser">Excluir Usuário</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 flex-1">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 sm:w-[150px] sm:flex-none"
              placeholder="De"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 sm:w-[150px] sm:flex-none"
              placeholder="Até"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
          </div>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum log encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {hasFilters ? 'Tente ajustar os filtros' : 'Ainda não há ações registradas'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="hidden sm:table-cell">Usuário Afetado</TableHead>
                  <TableHead className="hidden sm:table-cell">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{log.admin_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{log.admin_email || log.admin_user_id.slice(0, 8)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{log.target_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{log.target_email || log.target_user_id.slice(0, 8)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {formatDetails(log.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
