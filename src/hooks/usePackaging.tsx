import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

export interface Packaging {
  id: string;
  user_id: string;
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id: string | null;
  brand: string | null;
  supplier: string | null;
  dimensions: string | null;
  stock_quantity: number | null;
  min_stock_alert: number | null;
  cost_per_unit: number | null;
  created_at: string;
  updated_at: string;
}

export interface PackagingFormData {
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id?: string | null;
  brand?: string | null;
  supplier?: string | null;
  dimensions?: string | null;
  stock_quantity?: number | null;
  min_stock_alert?: number | null;
}

export function usePackaging() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: packagingItems = [], isLoading, error } = useQuery({
    queryKey: ['packaging', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('packaging')
        .select(`
          *,
          category:packaging_categories(id, name, color)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createPackaging = useMutation({
    mutationFn: async (packaging: PackagingFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const cost_per_unit = packaging.purchase_price / packaging.package_quantity;
      
      const { data, error } = await supabase
        .from('packaging')
        .insert({
          user_id: user.id,
          name: packaging.name,
          purchase_price: packaging.purchase_price,
          package_quantity: packaging.package_quantity,
          unit: packaging.unit,
          category_id: packaging.category_id || null,
          brand: packaging.brand || null,
          supplier: packaging.supplier || null,
          dimensions: packaging.dimensions || null,
          stock_quantity: packaging.stock_quantity ?? null,
          min_stock_alert: packaging.min_stock_alert ?? null,
          cost_per_unit,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast.success('Embalagem criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar embalagem:', error);
      toast.error('Erro ao criar embalagem');
    },
  });

  const updatePackaging = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<PackagingFormData>) => {
      const updateData: Record<string, unknown> = { ...updates };
      
      if (updates.purchase_price !== undefined && updates.package_quantity !== undefined) {
        updateData.cost_per_unit = updates.purchase_price / updates.package_quantity;
      }
      
      const { data, error } = await supabase
        .from('packaging')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast.success('Embalagem atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar embalagem:', error);
      toast.error('Erro ao atualizar embalagem');
    },
  });

  const deletePackaging = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packaging')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast.success('Embalagem excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir embalagem:', error);
      toast.error('Erro ao excluir embalagem');
    },
  });

  return {
    packagingItems,
    isLoading,
    error,
    createPackaging,
    updatePackaging,
    deletePackaging,
  };
}
