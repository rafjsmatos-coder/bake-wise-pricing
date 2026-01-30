import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { AuthForm } from '@/components/auth/AuthForm';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from './Dashboard';
import { AdminDashboard } from './AdminDashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [adminGateTimedOut, setAdminGateTimedOut] = useState(false);

  // Evita travar no loading do admin (ex: CORS/rede). Após um pequeno timeout,
  // seguimos como usuário comum e, se isAdmin virar true depois, alterna para o painel.
  useEffect(() => {
    if (!user) {
      setAdminGateTimedOut(false);
      return;
    }

    if (!isAdminLoading) {
      setAdminGateTimedOut(false);
      return;
    }

    setAdminGateTimedOut(false);
    const t = window.setTimeout(() => setAdminGateTimedOut(true), 1500);
    return () => window.clearTimeout(t);
  }, [user, isAdminLoading]);

  // Show loading while auth or admin role is being checked
  if (loading || (user && isAdminLoading && !adminGateTimedOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    if (showAuthForm) {
      return <AuthForm onBack={() => setShowAuthForm(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuthForm(true)} />;
  }

  // Admin sees the admin panel exclusively
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Regular users see the pricing dashboard
  return <Dashboard />;
};

export default Index;
