import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FinancialTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  order_id: string | null;
  created_at: string;
}

export interface TransactionFormData {
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  order_id?: string | null;
}

export const INCOME_CATEGORIES = [
  'Venda de Pedido',
  'Venda Avulsa',
  'Outros Recebimentos',
];

export const EXPENSE_CATEGORIES = [
  'Material / Ingredientes',
  'Embalagens',
  'Aluguel',
  'Energia Elétrica',
  'Gás',
  'Água',
  'Transporte / Entrega',
  'Marketing',
  'Equipamentos',
  'Manutenção',
  'Impostos',
  'Outros Gastos',
];

export function useFinancial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as FinancialTransaction[];
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user?.id) throw new Error('Não autenticado');
      const { error } = await supabase.from('financial_transactions').insert({
        user_id: user.id,
        ...data,
        order_id: data.order_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast.success('Transação registrada!');
    },
    onError: () => toast.error('Erro ao registrar transação'),
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormData }) => {
      const { error } = await supabase
        .from('financial_transactions')
        .update({ ...data, order_id: data.order_id || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast.success('Transação atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar transação'),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast.success('Transação excluída!');
    },
    onError: () => toast.error('Erro ao excluir transação'),
  });

  return { transactions, isLoading, createTransaction, updateTransaction, deleteTransaction };
}
