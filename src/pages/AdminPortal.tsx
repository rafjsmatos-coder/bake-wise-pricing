import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminAuthForm } from '@/components/auth/AdminAuthForm';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldX, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_CHECK_TIMEOUT = 5000;

async function getFreshAccessToken(): Promise<string | null> {
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), ADMIN_CHECK_TIMEOUT);
  });

  const tokenPromise = (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        return sessionData.session.access_token;
      }
      const { data: refreshData } = await supabase.auth.refreshSession();
      return refreshData?.session?.access_token || null;
    } catch {
      return null;
    }
  })();

  return Promise.race([tokenPromise, timeoutPromise]);
}

type PortalState = 'loading' | 'login' | 'checking' | 'denied' | 'admin';

export function AdminPortal() {
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [state, setState] = useState<PortalState>('loading');
  const checkedUserRef = useRef<string | null>(null);

  const checkAdminRole = useCallback(async () => {
    if (!user) {
      setState('login');
      return;
    }

    // Don't re-check same user
    if (checkedUserRef.current === user.id) {
      return;
    }

    setState('checking');

    const freshToken = await getFreshAccessToken();
    if (!freshToken) {
      toast.error('Erro de autenticação', {
        description: 'Sessão expirada. Faça login novamente.',
      });
      await signOut();
      setState('login');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-admin-role', {
        headers: { Authorization: `Bearer ${freshToken}` },
      });

      if (error) {
        console.error('[AdminPortal] Error checking admin role:', error);
        setState('denied');
        return;
      }

      checkedUserRef.current = user.id;

      if (data?.isAdmin) {
        setState('admin');
      } else {
        setState('denied');
      }
    } catch (err) {
      console.error('[AdminPortal] Exception:', err);
      setState('denied');
    }
  }, [user, signOut]);

  useEffect(() => {
    if (authLoading) {
      setState('loading');
      return;
    }

    if (!user) {
      setState('login');
      checkedUserRef.current = null;
      return;
    }

    // User is logged in, check if admin
    checkAdminRole();
  }, [user, authLoading, checkAdminRole]);

  const handleLoginSuccess = () => {
    // After login, the user state will update and trigger checkAdminRole
    setState('checking');
  };

  const handleAccessDenied = async () => {
    toast.error('Acesso negado', {
      description: 'Esta conta não possui permissão de administrador.',
    });
    await signOut();
    setState('login');
  };

  const handleSignOut = async () => {
    await signOut();
    checkedUserRef.current = null;
    setState('login');
  };

  // Loading auth state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Show login form
  if (state === 'login') {
    return (
      <AdminAuthForm 
        onLoginSuccess={handleLoginSuccess} 
        onAccessDenied={handleAccessDenied}
      />
    );
  }

  // Checking admin role
  if (state === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-slate-400">Verificando permissões...</p>
      </div>
    );
  }

  // Access denied
  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-slate-400">
              Esta conta não possui permissões de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignOut}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair e tentar outra conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin access granted
  return <AdminDashboard />;
}
