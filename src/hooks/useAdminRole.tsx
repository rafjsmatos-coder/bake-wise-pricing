import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminRoleContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: () => Promise<void>;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

// Timeout de segurança para evitar loading infinito
const ADMIN_CHECK_TIMEOUT = 5000;

/**
 * Helper to get a fresh access token with timeout
 */
async function getFreshAccessToken(): Promise<string | null> {
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), ADMIN_CHECK_TIMEOUT);
  });

  const tokenPromise = (async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData?.session?.access_token) {
        return sessionData.session.access_token;
      }

      // Try refresh if no session
      if (sessionError || !sessionData?.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session?.access_token) {
          return null;
        }
        
        return refreshData.session.access_token;
      }

      return null;
    } catch {
      return null;
    }
  })();

  return Promise.race([tokenPromise, timeoutPromise]);
}

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Usar useRef ao invés de useState para evitar re-renders que causam loop infinito
  const lastCheckedUserIdRef = useRef<string | null>(null);

  const checkAdminRole = useCallback(async () => {
    setIsLoading(true);
    
    const freshToken = await getFreshAccessToken();

    if (!freshToken) {
      setIsAdmin(false);
      setIsLoading(false);
      lastCheckedUserIdRef.current = null;
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-admin-role', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (error) {
        console.error('[useAdminRole] Error checking admin role:', error);
        setIsAdmin(false);
      } else if (data?.code === 'unauthenticated') {
        // Session expired, not an admin
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.isAdmin || false);
        lastCheckedUserIdRef.current = data?.userId || null;
      }
    } catch (err) {
      console.error('[useAdminRole] Exception:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth state changes to re-check admin role
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.id !== lastCheckedUserIdRef.current) {
          // New user signed in, re-check admin role
          await checkAdminRole();
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setIsLoading(false);
          lastCheckedUserIdRef.current = null;
        }
      }
    );

    // Initial check
    checkAdminRole();

    return () => subscription.unsubscribe();
  }, [checkAdminRole]); // SEM lastCheckedUserId nas dependências

  return (
    <AdminRoleContext.Provider value={{ isAdmin, isLoading, checkAdminRole }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (context === undefined) {
    throw new Error('useAdminRole must be used within an AdminRoleProvider');
  }
  return context;
}
