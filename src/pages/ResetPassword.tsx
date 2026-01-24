import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid session (from the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isValidSession) {
    // Redirect to home if no valid session
    navigate('/');
    return null;
  }

  return <ResetPasswordForm onSuccess={() => navigate('/')} />;
}
