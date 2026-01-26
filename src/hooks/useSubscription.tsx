import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  status: 'trial' | 'active' | 'canceled' | 'expired' | 'past_due' | 'loading';
  trial_end?: string;
  subscription_end?: string;
  days_remaining?: number;
  product_id?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<string | null>;
  getCustomerPortalUrl: () => Promise<string | null>;
  canAccessApp: boolean;
  sessionError: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * Helper to get a fresh access token, with refresh attempt if needed.
 */
async function getFreshAccessToken(): Promise<string | null> {
  // First try to get the current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionData?.session?.access_token) {
    return sessionData.session.access_token;
  }

  // If no session, try to refresh
  if (sessionError || !sessionData?.session) {
    console.log('[useSubscription] No session, attempting refresh...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData?.session?.access_token) {
      console.error('[useSubscription] Session refresh failed:', refreshError?.message);
      return null;
    }
    
    return refreshData.session.access_token;
  }

  return null;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session, signOut } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    status: 'loading',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  const checkSubscription = useCallback(async () => {
    const freshToken = await getFreshAccessToken();

    if (!freshToken || !user) {
      setSubscription({ subscribed: false, status: 'expired' });
      setIsLoading(false);
      setSessionError(!user ? false : true);
      return;
    }

    try {
      setIsLoading(true);
      setSessionError(false);
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription({ subscribed: false, status: 'expired' });
        setSessionError(true);
        return;
      }

      // Handle unauthenticated response
      if (data?.code === 'unauthenticated') {
        console.log('Session expired, user needs to re-login');
        setSubscription({ subscribed: false, status: 'expired' });
        setSessionError(true);
        return;
      }

      // Handle error in response body
      if (data?.error && !data?.status) {
        console.log('Subscription check returned error:', data.error);
        setSubscription({ subscribed: false, status: 'expired' });
        return;
      }

      setSubscription({
        subscribed: data.subscribed,
        status: data.status,
        trial_end: data.trial_end,
        subscription_end: data.subscription_end,
        days_remaining: data.days_remaining,
        product_id: data.product_id,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false, status: 'expired' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createCheckout = async (): Promise<string | null> => {
    const freshToken = await getFreshAccessToken();

    if (!freshToken) {
      console.error('No valid session available for checkout');
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente para continuar.",
        variant: "destructive",
      });
      setSessionError(true);
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Erro ao criar checkout",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        return null;
      }

      if (data.code === 'unauthenticated') {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente para continuar.",
          variant: "destructive",
        });
        setSessionError(true);
        return null;
      }

      if (data.already_subscribed) {
        toast({
          title: "Assinatura ativa",
          description: "Você já possui uma assinatura ativa.",
        });
        return null;
      }

      if (data.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getCustomerPortalUrl = async (): Promise<string | null> => {
    const freshToken = await getFreshAccessToken();

    if (!freshToken) {
      console.error('No valid session available for customer portal');
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      setSessionError(true);
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: "Erro ao abrir portal",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        return null;
      }

      if (data.code === 'unauthenticated') {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        setSessionError(true);
        return null;
      }

      if (data.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setSubscription({ subscribed: false, status: 'loading' });
      setIsLoading(false);
      setSessionError(false);
    }
  }, [user, session, checkSubscription]);

  // Check subscription on URL params (after checkout)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast({
        title: "Assinatura realizada!",
        description: "Bem-vindo ao Premium! Aguarde enquanto verificamos seu pagamento.",
      });
      
      // Wait a bit for webhook to process
      setTimeout(() => {
        checkSubscription();
      }, 2000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkoutStatus === 'canceled') {
      toast({
        title: "Checkout cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkSubscription]);

  // Periodic check every 30 minutes
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session, checkSubscription]);

  const canAccessApp = subscription.subscribed || subscription.status === 'trial' || subscription.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        checkSubscription,
        createCheckout,
        getCustomerPortalUrl,
        canAccessApp,
        sessionError,
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
