import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  instagram: string | null;
  whatsapp: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  orders_count?: number;
}

export interface ClientFormData {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
}

export function useClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('name');
      if (error) throw error;

      const { data: orderCounts, error: countError } = await supabase.from('orders').select('client_id').eq('user_id', user.id);
      if (countError) throw countError;

      const countsMap: Record<string, number> = {};
      orderCounts?.forEach((o: { client_id: string }) => { countsMap[o.client_id] = (countsMap[o.client_id] || 0) + 1; });

      return (data || []).map((client) => ({ ...client, orders_count: countsMap[client.id] || 0 })) as Client[];
    },
    enabled: !!user?.id,
  });

  const createClient = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const userId = await ensureSessionUserId();
      const { data: client, error } = await supabase.from('clients').insert({
        user_id: userId, name: data.name, phone: data.phone || null, email: data.email || null,
        address: data.address || null, neighborhood: data.neighborhood || null, city: data.city || null,
        state: data.state || null, zip_code: data.zip_code || null, instagram: data.instagram || null,
        whatsapp: data.whatsapp || null, notes: data.notes || null,
      }).select().single();
      if (error) throw error;
      return client;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente cadastrado com sucesso!'); },
    onError: (error) => { console.error('Erro ao criar cliente:', error); toast.error('Erro ao cadastrar cliente'); },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('clients').update({
        name: data.name, phone: data.phone || null, email: data.email || null,
        address: data.address || null, neighborhood: data.neighborhood || null, city: data.city || null,
        state: data.state || null, zip_code: data.zip_code || null, instagram: data.instagram || null,
        whatsapp: data.whatsapp || null, notes: data.notes || null,
      }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente atualizado com sucesso!'); },
    onError: (error) => { console.error('Erro ao atualizar cliente:', error); toast.error('Erro ao atualizar cliente'); },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente excluído com sucesso!'); },
    onError: (error) => { console.error('Erro ao excluir cliente:', error); toast.error('Erro ao excluir cliente'); },
  });

  return { clients, isLoading, error, createClient, updateClient, deleteClient };
}
