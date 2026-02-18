import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';

export interface DecorationCategory { id: string; user_id: string; name: string; color: string | null; description: string | null; created_at: string; updated_at: string; }
export interface CreateDecorationCategoryData { name: string; color?: string; description?: string; }
export interface UpdateDecorationCategoryData extends Partial<CreateDecorationCategoryData> {}

export function useDecorationCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['decoration-categories', user?.id],
    queryFn: async () => { const { data, error } = await supabase.from('decoration_categories').select('*').order('name'); if (error) throw error; return data as DecorationCategory[]; },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async (data: CreateDecorationCategoryData) => {
      const userId = await ensureSessionUserId();
      const { data: category, error } = await supabase.from('decoration_categories').insert({ user_id: userId, name: data.name, color: data.color || '#6366f1' }).select().single();
      if (error) throw error;
      return category as DecorationCategory;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decoration-categories', user?.id] }); toast.success('Categoria criada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao criar categoria', { description: error.message }); },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDecorationCategoryData }) => {
      await ensureSessionUserId();
      const { data: category, error } = await supabase.from('decoration_categories').update(data).eq('id', id).select().single();
      if (error) throw error;
      return category as DecorationCategory;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decoration-categories', user?.id] }); toast.success('Categoria atualizada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao atualizar categoria', { description: error.message }); },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('decoration_categories').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['decoration-categories', user?.id] }); toast.success('Categoria excluída com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao excluir categoria', { description: error.message }); },
  });

  return { categories: categoriesQuery.data || [], isLoading: categoriesQuery.isLoading, error: categoriesQuery.error, createCategory, updateCategory, deleteCategory };
}
