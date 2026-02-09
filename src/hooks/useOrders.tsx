import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  client_id: string;
  status: string;
  payment_status: string;
  delivery_date: string | null;
  total_amount: number;
  paid_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  };
  order_items?: OrderItem[];
}

export interface OrderItemFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
}

export interface OrderFormData {
  client_id: string;
  status: string;
  delivery_date?: string | null;
  paid_amount: number;
  notes?: string | null;
  items: OrderItemFormData[];
}

function calculatePaymentStatus(paidAmount: number, totalAmount: number): string {
  if (paidAmount <= 0) return 'pending';
  if (paidAmount >= totalAmount) return 'paid';
  return 'partial';
}

export function useOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(id, name, phone, whatsapp),
          order_items(id, order_id, product_id, quantity, unit_price, total_price, notes, created_at, product:products(id, name))
        `)
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id,
  });

  const createOrder = useMutation({
    mutationFn: async (data: OrderFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const totalAmount = data.items.reduce((sum, item) => sum + item.total_price, 0);
      const paymentStatus = calculatePaymentStatus(data.paid_amount, totalAmount);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_id: data.client_id,
          status: data.status,
          payment_status: paymentStatus,
          delivery_date: data.delivery_date || null,
          total_amount: totalAmount,
          paid_amount: data.paid_amount,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            data.items.map((item) => ({
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              notes: item.notes || null,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Pedido criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido');
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrderFormData }) => {
      const totalAmount = data.items.reduce((sum, item) => sum + item.total_price, 0);
      const paymentStatus = calculatePaymentStatus(data.paid_amount, totalAmount);

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          client_id: data.client_id,
          status: data.status,
          payment_status: paymentStatus,
          delivery_date: data.delivery_date || null,
          total_amount: totalAmount,
          paid_amount: data.paid_amount,
          notes: data.notes || null,
        })
        .eq('id', id);

      if (orderError) throw orderError;

      // Delete existing items and re-insert
      await supabase.from('order_items').delete().eq('order_id', id);

      if (data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            data.items.map((item) => ({
              order_id: id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              notes: item.notes || null,
            }))
          );

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Pedido atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar pedido:', error);
      toast.error('Erro ao atualizar pedido');
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Pedido excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir pedido:', error);
      toast.error('Erro ao excluir pedido');
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
