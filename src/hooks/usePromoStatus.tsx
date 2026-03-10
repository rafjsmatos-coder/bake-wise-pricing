import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PromoStatus {
  slotsUsed: number;
  slotsTotal: number;
  slotsRemaining: number;
  isActive: boolean;
  isLoading: boolean;
}

export function usePromoStatus() {
  const [promo, setPromo] = useState<PromoStatus>({
    slotsUsed: 0,
    slotsTotal: 35,
    slotsRemaining: 0,
    isActive: false,
    isLoading: true,
  });

  const fetchPromo = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('promo-status');
      if (error) throw error;

      setPromo({
        slotsUsed: data.slotsUsed,
        slotsTotal: data.slotsTotal,
        slotsRemaining: data.slotsRemaining,
        isActive: data.isActive,
        isLoading: false,
      });
    } catch (err) {
      console.error('[usePromoStatus] Error:', err);
      setPromo(prev => ({ ...prev, isActive: false, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchPromo();
  }, [fetchPromo]);

  return promo;
}
