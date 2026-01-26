import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  openCustomerPortal: () => Promise<void>;
  canAccessApp: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    status: 'loading',
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token || !user) {
      setSubscription({ subscribed: false, status: 'expired' });
      setIsLoading(false);
      return;
    }

    // Verificar se a sessão ainda é válida antes de chamar a edge function
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.log('Session invalid, skipping subscription check');
      setSubscription({ subscribed: false, status: 'expired' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription({ subscribed: false, status: 'expired' });
        return;
      }

      // Handle error in response body (graceful failure)
      if (data?.error) {
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
  }, [session?.access_token, user]);

  const createCheckout = async (): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session available');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return null;
      }

      if (data.already_subscribed) {
        console.log('User already has active subscription');
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      console.error('No session available');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setSubscription({ subscribed: false, status: 'loading' });
      setIsLoading(false);
    }
  }, [user, session, checkSubscription]);

  // Check subscription on URL params (after checkout)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      // Wait a bit for webhook to process
      setTimeout(() => {
        checkSubscription();
      }, 2000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkSubscription]);

  // Periodic check every 5 minutes
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 5 * 60 * 1000);

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
        openCustomerPortal,
        canAccessApp,
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
