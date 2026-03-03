import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';
import type { MeasurementUnit } from '@/lib/unit-conversion';

export interface Decoration {
  id: string;
  user_id: string;
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id: string | null;
  brand: string | null;
  supplier: string | null;
  stock_quantity: number | null;
  min_stock_alert: number | null;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
  decoration_categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface CreateDecorationData {
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id?: string | null;
  brand?: string | null;
  supplier?: string | null;
  stock_quantity?: number | null;
  min_stock_alert?: number | null;
}

export interface UpdateDecorationData extends Partial<CreateDecorationData> {}

export function useDecorations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const decorationsQuery = useQuery({
    queryKey: ['decorations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decorations')
        .select(`*, decoration_categories (id, name, color)`)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Decoration[];
    },
    enabled: !!user,
  });

  const createDecoration = useMutation({
    mutationFn: async (data: CreateDecorationData) => {
      const userId = await ensureSessionUserId();
      const cost_per_unit = data.purchase_price / data.package_quantity;
      const { data: decoration, error } = await supabase
        .from('decorations')
        .insert({ user_id: userId, ...data, cost_per_unit })
        .select(`*, decoration_categories (id, name, color)`)
        .single();
      if (error) throw error;
      return decoration as Decoration;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] }); toast.success('Decoração criada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao criar decoração', { description: error.message }); },
  });

  const updateDecoration = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDecorationData }) => {
      await ensureSessionUserId();
      const updateData: any = { ...data };
      if (data.purchase_price != null && data.package_quantity != null) {
        updateData.cost_per_unit = data.purchase_price / data.package_quantity;
      }
      const { data: decoration, error } = await supabase.from('decorations').update(updateData).eq('id', id).select(`*, decoration_categories (id, name, color)`).single();
      if (error) throw error;
      return decoration as Decoration;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] }); queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Decoração atualizada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao atualizar decoração', { description: error.message }); },
  });

  const deleteDecoration = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('decorations').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] }); toast.success('Decoração excluída com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao excluir decoração', { description: error.message }); },
  });

  const duplicateDecoration = useMutation({
    mutationFn: async (decoration: Decoration) => {
      const userId = await ensureSessionUserId();
      const { data, error } = await supabase
        .from('decorations')
        .insert({
          user_id: userId,
          name: `${decoration.name} (cópia)`,
          purchase_price: decoration.purchase_price,
          package_quantity: decoration.package_quantity,
          unit: decoration.unit,
          category_id: decoration.category_id,
          brand: decoration.brand,
          supplier: decoration.supplier,
          stock_quantity: decoration.stock_quantity,
          min_stock_alert: decoration.min_stock_alert,
          cost_per_unit: decoration.purchase_price / decoration.package_quantity,
        })
        .select(`*, decoration_categories (id, name, color)`)
        .single();
      if (error) throw error;
      return data as Decoration;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] }); toast.success('Decoração duplicada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao duplicar decoração', { description: error.message }); },
  });

  const deactivateDecoration = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('decorations').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] }); toast.success('Decoração desativada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao desativar decoração', { description: error.message }); },
  });

  return { decorations: decorationsQuery.data || [], isLoading: decorationsQuery.isLoading, error: decorationsQuery.error, createDecoration, updateDecoration, deleteDecoration, duplicateDecoration, deactivateDecoration };
}
