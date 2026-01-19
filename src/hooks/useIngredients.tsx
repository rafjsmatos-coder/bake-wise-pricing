import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
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

export function useIngredients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ingredientsQuery = useQuery({
    queryKey: ['ingredients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order('name');

      if (error) throw error;
      return data as Ingredient[];
    },
    enabled: !!user,
  });

  const createIngredient = useMutation({
    mutationFn: async (data: CreateIngredientData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;
      return ingredient as Ingredient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({
        title: 'Ingrediente criado',
        description: 'O ingrediente foi adicionado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar ingrediente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateIngredient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIngredientData }) => {
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;
      return ingredient as Ingredient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({
        title: 'Ingrediente atualizado',
        description: 'O ingrediente foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar ingrediente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({
        title: 'Ingrediente excluído',
        description: 'O ingrediente foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir ingrediente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    ingredients: ingredientsQuery.data || [],
    isLoading: ingredientsQuery.isLoading,
    error: ingredientsQuery.error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
}
