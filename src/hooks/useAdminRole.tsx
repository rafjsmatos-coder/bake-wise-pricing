import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminRoleContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: () => Promise<void>;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

/**
 * Helper to get a fresh access token
 */
async function getFreshAccessToken(): Promise<string | null> {
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
}

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = useCallback(async () => {
    const freshToken = await getFreshAccessToken();

    if (!freshToken) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
      }
    } catch (err) {
      console.error('[useAdminRole] Exception:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

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
