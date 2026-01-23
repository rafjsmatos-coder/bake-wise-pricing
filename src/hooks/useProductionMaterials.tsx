import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

export interface ProductionMaterial {
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
  cost_per_unit: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionMaterialFormData {
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

export function useProductionMaterials() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ['production-materials', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('production_materials')
        .select(`
          *,
          category:production_material_categories(id, name, color)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMaterial = useMutation({
    mutationFn: async (material: ProductionMaterialFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const cost_per_unit = material.purchase_price / material.package_quantity;
      
      const { data, error } = await supabase
        .from('production_materials')
        .insert({
          user_id: user.id,
          name: material.name,
          purchase_price: material.purchase_price,
          package_quantity: material.package_quantity,
          unit: material.unit,
          category_id: material.category_id || null,
          brand: material.brand || null,
          supplier: material.supplier || null,
          stock_quantity: material.stock_quantity ?? null,
          min_stock_alert: material.min_stock_alert ?? null,
          cost_per_unit,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-materials'] });
      toast.success('Material criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao criar material');
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProductionMaterialFormData>) => {
      const updateData: Record<string, unknown> = { ...updates };
      
      if (updates.purchase_price !== undefined && updates.package_quantity !== undefined) {
        updateData.cost_per_unit = updates.purchase_price / updates.package_quantity;
      }
      
      const { data, error } = await supabase
        .from('production_materials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-materials'] });
      toast.success('Material atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material');
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('production_materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-materials'] });
      toast.success('Material excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir material');
    },
  });

  return {
    materials,
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}
