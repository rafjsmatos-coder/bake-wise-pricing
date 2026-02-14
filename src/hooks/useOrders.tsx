import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  product?: { id: string; name: string };
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
  discount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: { id: string; name: string; phone: string | null; whatsapp: string | null };
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
  discount: number;
  notes?: string | null;
  items: OrderItemFormData[];
}

function calculatePaymentStatus(paidAmount: number, effectiveTotal: number): string {
  if (paidAmount <= 0) return 'pending';
  if (paidAmount >= effectiveTotal) return 'paid';
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
        .select(`*, client:clients(id, name, phone, whatsapp), order_items(id, order_id, product_id, quantity, unit_price, total_price, notes, created_at, product:products(id, name))`)
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id,
  });

  const createOrder = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const userId = await ensureSessionUserId();
      const totalAmount = data.items.reduce((sum, item) => sum + item.total_price, 0);
      const effectiveTotal = totalAmount - (data.discount || 0);
      const paymentStatus = calculatePaymentStatus(data.paid_amount, effectiveTotal);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId, client_id: data.client_id, status: data.status,
          payment_status: paymentStatus, delivery_date: data.delivery_date || null,
          total_amount: totalAmount, paid_amount: data.paid_amount,
          discount: data.discount || 0, notes: data.notes || null,
        })
        .select(`*, client:clients(id, name)`)
        .single();
      if (orderError) throw orderError;

      if (data.items.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          data.items.map((item) => ({
            order_id: order.id, product_id: item.product_id, quantity: item.quantity,
            unit_price: item.unit_price, total_price: item.total_price, notes: item.notes || null,
          }))
        );
        if (itemsError) throw itemsError;
      }

      if (data.paid_amount > 0) {
        const clientName = order.client?.name || 'Cliente';
        await supabase.from('financial_transactions').insert({
          user_id: userId, type: 'income', category: 'Venda de Pedido',
          description: `Pagamento pedido - ${clientName}`, amount: data.paid_amount,
          date: new Date().toISOString().split('T')[0], order_id: order.id,
        });
      }
      return order;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); queryClient.invalidateQueries({ queryKey: ['clients'] }); queryClient.invalidateQueries({ queryKey: ['financial'] }); toast.success('Pedido criado com sucesso!'); },
    onError: (error) => { console.error('Erro ao criar pedido:', error); toast.error('Erro ao criar pedido'); },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrderFormData }) => {
      const userId = await ensureSessionUserId();
      const totalAmount = data.items.reduce((sum, item) => sum + item.total_price, 0);
      const effectiveTotal = totalAmount - (data.discount || 0);
      const paymentStatus = calculatePaymentStatus(data.paid_amount, effectiveTotal);

      const { error: orderError } = await supabase.from('orders').update({
        client_id: data.client_id, status: data.status, payment_status: paymentStatus,
        delivery_date: data.delivery_date || null, total_amount: totalAmount,
        paid_amount: data.paid_amount, discount: data.discount || 0, notes: data.notes || null,
      }).eq('id', id);
      if (orderError) throw orderError;

      await supabase.from('order_items').delete().eq('order_id', id);
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          data.items.map((item) => ({
            order_id: id, product_id: item.product_id, quantity: item.quantity,
            unit_price: item.unit_price, total_price: item.total_price, notes: item.notes || null,
          }))
        );
        if (itemsError) throw itemsError;
      }

      if (data.paid_amount > 0) {
        const { data: clientData } = await supabase.from('clients').select('name').eq('id', data.client_id).single();
        const clientName = clientData?.name || 'Cliente';
        const { data: existing } = await supabase.from('financial_transactions').select('id').eq('order_id', id).eq('user_id', userId).maybeSingle();
        if (existing) {
          await supabase.from('financial_transactions').update({ amount: data.paid_amount, date: new Date().toISOString().split('T')[0] }).eq('id', existing.id);
        } else {
          await supabase.from('financial_transactions').insert({ user_id: userId, type: 'income', category: 'Venda de Pedido', description: `Pagamento pedido - ${clientName}`, amount: data.paid_amount, date: new Date().toISOString().split('T')[0], order_id: id });
        }
      } else {
        await supabase.from('financial_transactions').delete().eq('order_id', id).eq('user_id', userId);
      }
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); queryClient.invalidateQueries({ queryKey: ['clients'] }); queryClient.invalidateQueries({ queryKey: ['financial'] }); toast.success('Pedido atualizado com sucesso!'); },
    onError: (error) => { console.error('Erro ao atualizar pedido:', error); toast.error('Erro ao atualizar pedido'); },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); toast.success('Status atualizado!'); },
    onError: (error) => { console.error('Erro ao atualizar status:', error); toast.error('Erro ao atualizar status'); },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Pedido excluído com sucesso!'); },
    onError: (error) => { console.error('Erro ao excluir pedido:', error); toast.error('Erro ao excluir pedido'); },
  });

  const duplicateOrder = useMutation({
    mutationFn: async (order: Order) => {
      const userId = await ensureSessionUserId();
      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        user_id: userId, client_id: order.client_id, status: 'pending', payment_status: 'pending',
        delivery_date: null, total_amount: order.total_amount, paid_amount: 0, discount: order.discount || 0, notes: order.notes,
      }).select().single();
      if (orderError) throw orderError;

      if (order.order_items && order.order_items.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          order.order_items.map((item) => ({ order_id: newOrder.id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price, total_price: item.total_price, notes: item.notes }))
        );
        if (itemsError) throw itemsError;
      }
      return newOrder;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); toast.success('Pedido duplicado com sucesso!'); },
    onError: (error) => { console.error('Erro ao duplicar pedido:', error); toast.error('Erro ao duplicar pedido'); },
  });

  return { orders, isLoading, error, createOrder, updateOrder, updateOrderStatus, deleteOrder, duplicateOrder };
}
