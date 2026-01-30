import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Hook para gerenciar estado de assinatura com sincronização de auth

type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled' | 'pending' | 'loading';

interface SubscriptionState {
  status: SubscriptionStatus;
  canAccess: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  daysRemaining: number | null;
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  startCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Helper para obter token fresco
async function getFreshAccessToken(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session?.access_token) {
    const { data: refreshData } = await supabase.auth.refreshSession();
    return refreshData.session?.access_token || null;
  }
  
  return sessionData.session.access_token;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    status: 'loading',
    canAccess: false,
    trialEndsAt: null,
    subscriptionEndsAt: null,
    daysRemaining: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    // Se não há usuário, definir isLoading: false (não há nada para verificar)
    if (!user) {
      setState({
        status: 'loading',
        canAccess: false,
        trialEndsAt: null,
        subscriptionEndsAt: null,
        daysRemaining: null,
        isLoading: false,
      });
      return;
    }

    // Iniciar loading antes da chamada
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const token = await getFreshAccessToken();
      if (!token) {
        console.error('[useSubscription] No token available');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        console.error('[useSubscription] Error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState({
        status: data.status,
        canAccess: data.canAccess,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        subscriptionEndsAt: data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt) : null,
        daysRemaining: data.daysRemaining,
        isLoading: false,
      });
    } catch (err) {
      console.error('[useSubscription] Exception:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  const startCheckout = useCallback(async () => {
    try {
      const token = await getFreshAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('[useSubscription] Checkout error:', err);
      throw err;
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      const token = await getFreshAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('[useSubscription] Portal error:', err);
      throw err;
    }
  }, []);

  // Check subscription on mount and when user/auth changes
  useEffect(() => {
    // Aguardar auth resolver antes de fazer qualquer coisa
    if (authLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }
    
    // Auth resolvido - verificar subscription (ou limpar se não há usuário)
    checkSubscription();
  }, [checkSubscription, authLoading]);

  // Polling every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        checkSubscription,
        startCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
