import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminRoleContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: () => Promise<void>;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = useCallback(async () => {
    if (!session?.access_token) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-admin-role', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('[useAdminRole] Error checking admin role:', error);
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
  }, [session?.access_token]);

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
