import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';

export interface ProductCategory { id: string; user_id: string; name: string; color: string | null; description: string | null; created_at: string; updated_at: string; }
export interface CreateProductCategoryData { name: string; color?: string; description?: string; }
export interface UpdateProductCategoryData extends Partial<CreateProductCategoryData> {}

export function useProductCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['product-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('product_categories').select('*').eq('user_id', user.id).order('name');
      if (error) throw error;
      return data as ProductCategory[];
    },
    enabled: !!user?.id,
  });

  const createCategory = useMutation({
    mutationFn: async (category: CreateProductCategoryData) => {
      const userId = await ensureSessionUserId();
      const { data, error } = await supabase.from('product_categories').insert({ user_id: userId, name: category.name, color: category.color || '#6366f1', description: category.description || null }).select().single();
      if (error) throw error;
      return data;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product-categories'] }); toast.success('Categoria de produto criada com sucesso!'); },
    onError: (error) => { console.error('Erro ao criar categoria:', error); toast.error('Erro ao criar categoria de produto'); },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductCategoryData }) => {
      await ensureSessionUserId();
      const { data: category, error } = await supabase.from('product_categories').update(data).eq('id', id).select().single();
      if (error) throw error;
      return category;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product-categories'] }); toast.success('Categoria de produto atualizada com sucesso!'); },
    onError: (error) => { console.error('Erro ao atualizar categoria:', error); toast.error('Erro ao atualizar categoria de produto'); },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product-categories'] }); toast.success('Categoria de produto excluída com sucesso!'); },
    onError: (error) => { console.error('Erro ao excluir categoria:', error); toast.error('Erro ao excluir categoria de produto'); },
  });

  return { categories, isLoading, error, createCategory, updateCategory, deleteCategory };
}
