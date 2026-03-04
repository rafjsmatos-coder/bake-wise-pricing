import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';
import type { MeasurementUnit } from '@/lib/unit-conversion';

export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id: string | null;
  brand: string | null;
  supplier: string | null;
  expiry_date: string | null;
  stock_quantity: number | null;
  min_stock_alert: number | null;
  cost_per_unit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface CreateIngredientData {
  name: string;
  purchase_price: number;
  package_quantity: number;
  unit: MeasurementUnit;
  category_id?: string | null;
  brand?: string | null;
  supplier?: string | null;
  expiry_date?: string | null;
  stock_quantity?: number | null;
  min_stock_alert?: number | null;
}

export interface UpdateIngredientData extends Partial<CreateIngredientData> {}

export function useIngredients(options?: { includeInactive?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const includeInactive = options?.includeInactive ?? false;

  const ingredientsQuery = useQuery({
    queryKey: ['ingredients', user?.id, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `);
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query.order('name');

      if (error) throw error;
      return data as Ingredient[];
    },
    enabled: !!user,
  });

  const createIngredient = useMutation({
    mutationFn: async (data: CreateIngredientData) => {
      const userId = await ensureSessionUserId();
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .insert({ user_id: userId, ...data })
        .select(`*, categories (id, name, color)`)
        .single();
      if (error) throw error;
      return ingredient as Ingredient;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingrediente criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar ingrediente', { description: error.message });
    },
  });

  const updateIngredient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIngredientData }) => {
      await ensureSessionUserId();
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .update(data)
        .eq('id', id)
        .select(`*, categories (id, name, color)`)
        .single();
      if (error) throw error;
      return ingredient as Ingredient;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Ingrediente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar ingrediente', { description: error.message });
    },
  });

  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('ingredients').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingrediente excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir ingrediente', { description: error.message });
    },
  });

  const duplicateIngredient = useMutation({
    mutationFn: async (ingredient: Ingredient) => {
      const userId = await ensureSessionUserId();
      const { data, error } = await supabase
        .from('ingredients')
        .insert({
          user_id: userId,
          name: `${ingredient.name} (cópia)`,
          purchase_price: ingredient.purchase_price,
          package_quantity: ingredient.package_quantity,
          unit: ingredient.unit,
          category_id: ingredient.category_id,
          brand: ingredient.brand,
          supplier: ingredient.supplier,
          stock_quantity: ingredient.stock_quantity,
          min_stock_alert: ingredient.min_stock_alert,
        })
        .select(`*, categories (id, name, color)`)
        .single();
      if (error) throw error;
      return data as Ingredient;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingrediente duplicado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao duplicar ingrediente', { description: error.message });
    },
  });

  const deactivateIngredient = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('ingredients').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingrediente desativado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao desativar ingrediente', { description: error.message });
    },
  });

  const reactivateIngredient = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('ingredients').update({ is_active: true }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingrediente reativado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao reativar ingrediente', { description: error.message });
    },
  });

  return {
    ingredients: ingredientsQuery.data || [],
    isLoading: ingredientsQuery.isLoading,
    error: ingredientsQuery.error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    duplicateIngredient,
    deactivateIngredient,
    reactivateIngredient,
  };
}
