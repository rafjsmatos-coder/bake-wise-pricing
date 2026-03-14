import { useState, useMemo } from 'react';
import { useFinancial, FinancialTransaction, TransactionFormData } from '@/hooks/useFinancial';
import { TransactionForm } from '@/components/financial/TransactionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Loader2, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TransactionsList() {
  const { transactions, isLoading, createTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FinancialTransaction | null>(null);
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('income');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));

  const filtered = useMemo(() => {
    const monthStart = startOfMonth(parseISO(monthFilter + '-01'));
    const monthEnd = endOfMonth(monthStart);

    return transactions.filter((t) => {
      const d = parseISO(t.date);
      if (d < monthStart || d > monthEnd) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, search, monthFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = transactions.map(t => t.category).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [transactions]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const handleNew = (type: 'income' | 'expense') => {
    setSelected(null);
    setDefaultType(type);
    setFormOpen(true);
  };

  const handleEdit = (t: FinancialTransaction) => {
    setSelected(t);
    setFormOpen(true);
  };

  const handleSubmit = (data: TransactionFormData) => {
    if (selected) {
      updateTransaction.mutate({ id: selected.id, data }, { onSuccess: () => setFormOpen(false) });
    } else {
      createTransaction.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (selected) {
      deleteTransaction.mutate(selected.id, { onSuccess: () => setDeleteOpen(false) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Entradas e Saídas</h1>
          <p className="text-muted-foreground">Controle o dinheiro que entra e sai do seu negócio</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleNew('income')} className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Entrada
          </Button>
          <Button onClick={() => handleNew('expense')} variant="destructive" className="gap-2">
            <Plus className="h-4 w-4" />
            Saída
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
            Entradas
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
            Saídas
          </div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totals.expense)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            Saldo
          </div>
          <p className={`text-xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(totals.balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full sm:w-[180px] min-h-[44px]"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>
        {uniqueCategories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
            >
              {t.type === 'income' ? (
                <ArrowUpCircle className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} • {format(parseISO(t.date), 'dd/MM/yyyy')}
                </p>
              </div>
              <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(t); setDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum registro ainda</h3>
          <p className="text-muted-foreground">Anote o que entra e o que sai para saber como está seu caixa.</p>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={selected}
        defaultType={defaultType}
        onSubmit={handleSubmit}
        isLoading={createTransaction.isPending || updateTransaction.isPending}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
