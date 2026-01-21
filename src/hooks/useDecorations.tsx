import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const decorationsQuery = useQuery({
    queryKey: ['decorations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decorations')
        .select(`
          *,
          decoration_categories (
            id,
            name,
            color
          )
        `)
        .order('name');

      if (error) throw error;
      return data as Decoration[];
    },
    enabled: !!user,
  });

  const createDecoration = useMutation({
    mutationFn: async (data: CreateDecorationData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: decoration, error } = await supabase
        .from('decorations')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select(`
          *,
          decoration_categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;
      return decoration as Decoration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] });
      toast({
        title: 'Decoração criada',
        description: 'A decoração foi adicionada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar decoração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateDecoration = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDecorationData }) => {
      const { data: decoration, error } = await supabase
        .from('decorations')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          decoration_categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;
      return decoration as Decoration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Decoração atualizada',
        description: 'A decoração foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar decoração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDecoration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('decorations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decorations', user?.id] });
      toast({
        title: 'Decoração excluída',
        description: 'A decoração foi excluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir decoração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    decorations: decorationsQuery.data || [],
    isLoading: decorationsQuery.isLoading,
    error: decorationsQuery.error,
    createDecoration,
    updateDecoration,
    deleteDecoration,
  };
}
