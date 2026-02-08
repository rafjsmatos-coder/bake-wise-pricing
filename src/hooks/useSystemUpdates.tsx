import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SystemUpdate {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'improvement' | 'fix';
  is_published: boolean;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateView {
  id: string;
  user_id: string;
  last_seen_at: string;
}

export function useSystemUpdates({ isAdmin = false } = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch updates (published for users, all for admins)
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['system-updates', isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('system_updates')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (!isAdmin) {
        query = query.eq('is_published', true).not('published_at', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SystemUpdate[];
    },
    enabled: !!user,
  });

  // Fetch user's last seen timestamp
  const { data: lastSeenAt } = useQuery({
    queryKey: ['user-update-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_update_views')
        .select('last_seen_at')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data?.last_seen_at || null;
    },
    enabled: !!user && !isAdmin,
  });

  // Count unseen updates
  const unseenCount = !isAdmin && lastSeenAt
    ? updates.filter(u => u.published_at && new Date(u.published_at) > new Date(lastSeenAt)).length
    : !isAdmin && !lastSeenAt
      ? updates.length
      : 0;

  // Mark updates as seen
  const markAsSeen = async () => {
    if (!user || isAdmin) return;
    
    const { data: existing } = await supabase
      .from('user_update_views')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_update_views')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_update_views')
        .insert({ user_id: user.id, last_seen_at: new Date().toISOString() });
    }

    queryClient.invalidateQueries({ queryKey: ['user-update-views'] });
  };

  // Admin: Create update
  const createUpdate = useMutation({
    mutationFn: async (data: { title: string; content: string; type: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('system_updates')
        .insert({
          ...data,
          created_by: user!.id,
          published_at: data.is_published ? new Date().toISOString() : null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast.success('Atualização criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar atualização.');
    },
  });

  // Admin: Update
  const updateUpdate = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string; type: string; is_published: boolean }) => {
      const updateData: Record<string, unknown> = { ...data };
      
      // If publishing for the first time, set published_at
      if (data.is_published) {
        const existing = updates.find(u => u.id === id);
        if (!existing?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      } else {
        updateData.published_at = null;
      }

      const { error } = await supabase
        .from('system_updates')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast.success('Atualização salva com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao salvar atualização.');
    },
  });

  // Admin: Delete
  const deleteUpdate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_updates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast.success('Atualização excluída!');
    },
    onError: () => {
      toast.error('Erro ao excluir atualização.');
    },
  });

  // Admin: Toggle publish
  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const updateData: Record<string, unknown> = { is_published };
      if (is_published) {
        const existing = updates.find(u => u.id === id);
        if (!existing?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('system_updates')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao alterar status.');
    },
  });

  return {
    updates,
    isLoading,
    unseenCount,
    lastSeenAt,
    markAsSeen,
    createUpdate,
    updateUpdate,
    deleteUpdate,
    togglePublish,
  };
}
