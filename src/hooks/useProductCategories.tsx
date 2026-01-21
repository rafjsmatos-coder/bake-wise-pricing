import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ProductCategory {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export function useProductCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['product-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as ProductCategory[];
    },
    enabled: !!user?.id,
  });

  const createCategory = useMutation({
    mutationFn: async (category: { name: string; color?: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          user_id: user.id,
          name: category.name,
          color: category.color || '#6366f1',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Categoria de produto criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria de produto');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ name, color })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Categoria de produto atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria de produto');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Categoria de produto excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria de produto');
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
