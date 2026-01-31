import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id: string;
  user_id: string;
  default_safety_margin: number;
  include_gas_cost: boolean;
  gas_cost_per_hour: number;
  include_energy_cost: boolean;
  energy_cost_per_hour: number;
  include_labor_cost: boolean;
  labor_cost_per_hour: number;
  indirect_operational_cost_percent: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsData {
  default_safety_margin?: number;
  include_gas_cost?: boolean;
  gas_cost_per_hour?: number;
  include_energy_cost?: boolean;
  energy_cost_per_hour?: number;
  include_labor_cost?: boolean;
  labor_cost_per_hour?: number;
  indirect_operational_cost_percent?: number;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user!.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings as UserSettings;
      }
      
      return data as UserSettings;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (data: UpdateUserSettingsData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: settings, error } = await supabase
        .from('user_settings')
        .update(data)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return settings as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
      // Invalidate recipes and products to trigger cost recalculation with updated settings
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram atualizadas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings,
  };
}
