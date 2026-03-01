import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';

export interface UserSettings {
  id: string;
  user_id: string;
  default_safety_margin: number;
  oven_type: 'gas' | 'electric' | 'both';
  include_gas_cost: boolean;
  gas_cost_per_hour: number;
  electric_oven_cost_per_hour: number;
  default_oven_type: 'gas' | 'electric';
  include_energy_cost: boolean;
  energy_cost_per_hour: number;
  include_labor_cost: boolean;
  labor_cost_per_hour: number;
  indirect_operational_cost_percent: number;
  whatsapp_quote_template: string | null;
  whatsapp_confirmation_template: string | null;
  whatsapp_reminder_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsData {
  default_safety_margin?: number;
  oven_type?: 'gas' | 'electric' | 'both';
  include_gas_cost?: boolean;
  gas_cost_per_hour?: number;
  electric_oven_cost_per_hour?: number;
  default_oven_type?: 'gas' | 'electric';
  include_energy_cost?: boolean;
  energy_cost_per_hour?: number;
  include_labor_cost?: boolean;
  labor_cost_per_hour?: number;
  indirect_operational_cost_percent?: number;
  whatsapp_quote_template?: string;
  whatsapp_confirmation_template?: string;
  whatsapp_reminder_template?: string;
}

export function useUserSettings() {
  const { user } = useAuth();
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
      const userId = await ensureSessionUserId();

      const { data: settings, error } = await supabase
        .from('user_settings')
        .update(data)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return settings as UserSettings;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao salvar configurações', { description: error.message });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings,
  };
}
