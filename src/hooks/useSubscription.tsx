import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { prepareExternalNavigation } from '@/lib/open-external';

// Hook para gerenciar estado de assinatura com sincronização de auth

type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled' | 'pending' | 'loading';
type SubscriptionError = 'TOKEN_MISSING' | 'NETWORK_ERROR' | 'TIMEOUT' | null;

interface SubscriptionState {
  status: SubscriptionStatus;
  canAccess: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  daysRemaining: number | null;
  isLoading: boolean;
  initialized: boolean;
  error: SubscriptionError;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  startCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Failsafe timeout for subscription check (ms)
const SUBSCRIPTION_CHECK_TIMEOUT = 6000;

// Helper para obter token fresco
async function getFreshAccessToken(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session?.access_token) {
      const { data: refreshData } = await supabase.auth.refreshSession();
      return refreshData.session?.access_token || null;
    }
    
    return sessionData.session.access_token;
  } catch (err) {
    console.error('[useSubscription] Token fetch error:', err);
    return null;
  }
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
    initialized: false,
    error: null,
  });
  
  const isPollingRef = useRef(false);

  const checkSubscription = useCallback(async (isPolling = false) => {
    // Se não há usuário, limpar estado e sair do loading
    if (!user) {
      setState({
        status: 'loading',
        canAccess: false,
        trialEndsAt: null,
        subscriptionEndsAt: null,
        daysRemaining: null,
        isLoading: false,
        initialized: true,
        error: null,
      });
      return;
    }

    // Se é polling OU já estamos inicializados com acesso, não setar isLoading para evitar "flash" na UI
    if (!isPolling && !state.initialized) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    } else if (!isPolling) {
      setState(prev => ({ ...prev, error: null }));
    }

    // Timeout failsafe
    const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
      setTimeout(() => resolve({ timeout: true }), SUBSCRIPTION_CHECK_TIMEOUT);
    });

    try {
      const token = await getFreshAccessToken();
      
      if (!token) {
        console.error('[useSubscription] No token available');
        setState(prev => ({
          ...prev,
          isLoading: false,
          initialized: true,
          error: 'TOKEN_MISSING',
        }));
        return;
      }

      const fetchPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      // Check if it was a timeout
      if ('timeout' in result) {
        console.error('[useSubscription] Check timed out');
        // Se é polling, não modificar estado para não derrubar usuário
        if (!isPolling) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            initialized: true,
            error: 'TIMEOUT',
          }));
        }
        return;
      }

      const { data, error } = result;

      if (error) {
        console.error('[useSubscription] Error:', error);
        // Se é polling, não modificar estado para não derrubar usuário
        if (!isPolling) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            initialized: true,
            error: 'NETWORK_ERROR',
          }));
        }
        return;
      }

      setState({
        status: data.status,
        canAccess: data.canAccess,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        subscriptionEndsAt: data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt) : null,
        daysRemaining: data.daysRemaining,
        isLoading: false,
        initialized: true,
        error: null,
      });
    } catch (err) {
      console.error('[useSubscription] Exception:', err);
      // Se é polling, não modificar estado para não derrubar usuário
      if (!isPolling) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          initialized: true,
          error: 'NETWORK_ERROR',
        }));
      }
    }
  }, [user]);

  const startCheckout = useCallback(async () => {
    try {
      // Pre-open navigation BEFORE async to avoid popup blockers on mobile
      const navigate = prepareExternalNavigation();
      
      const token = await getFreshAccessToken();
      if (!token) {
        navigate(null); // close blank tab if opened
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        navigate(null);
        throw error;
      }

      navigate(data?.url || null);
    } catch (err) {
      console.error('[useSubscription] Checkout error:', err);
      throw err;
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      // Pre-open navigation BEFORE async to avoid popup blockers on mobile
      const navigate = prepareExternalNavigation();
      
      const token = await getFreshAccessToken();
      if (!token) {
        navigate(null);
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        navigate(null);
        throw error;
      }

      navigate(data?.url || null);
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
    checkSubscription(false);
  }, [checkSubscription, authLoading]);

  // Polling every minute (silent refresh, no loading state change)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!isPollingRef.current) {
        isPollingRef.current = true;
        checkSubscription(true).finally(() => {
          isPollingRef.current = false;
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Wrapper para expor checkSubscription sem parâmetro
  const publicCheckSubscription = useCallback(async () => {
    await checkSubscription(false);
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        checkSubscription: publicCheckSubscription,
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
