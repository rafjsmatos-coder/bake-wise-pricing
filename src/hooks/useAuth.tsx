import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session, AuthError, AuthApiError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Failsafe timeout to prevent infinite loading (ms)
const AUTH_INIT_TIMEOUT = 4000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const didInitRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!isMounted) return;
        
        // Only update user/session if user actually changed (prevents unnecessary re-renders on TOKEN_REFRESHED)
        setUser(prev => {
          const newUser = newSession?.user ?? null;
          if (prev?.id === newUser?.id) return prev; // same user, keep stable reference
          return newUser;
        });
        setSession(newSession);
        setLoading(false);
        // Clear timeout if auth event fires
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    );

    // Failsafe timeout: if loading stays true for too long, force it to false
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[useAuth] Auth init timeout reached, forcing loading=false');
        setLoading(false);
      }
    }, AUTH_INIT_TIMEOUT);

    // Get initial session with error handling
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[useAuth] getSession error:', error);
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('[useAuth] getSession exception:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          // Clear timeout since we're done
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Use custom edge function to create user + send PT-BR email via Resend
      const response = await supabase.functions.invoke('send-auth-email', {
        body: {
          action: 'signup',
          email,
          password,
          fullName: fullName || '',
          redirectTo: window.location.origin,
        },
      });

      if (response.error) {
        const errorMessage = response.error.message || 'Erro ao criar conta';
        return { error: new AuthApiError(errorMessage, 400, 'signup_error') };
      }

      const data = response.data;
      if (data?.error) {
        return { error: new AuthApiError(data.error, 400, 'signup_error') };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      return { error: new AuthApiError(message, 500, 'signup_error') };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider (check duplicate imports: use \'@/hooks/useAuth\' everywhere)');
  }
  return context;
}
