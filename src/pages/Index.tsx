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
  const { isAdmin, isLoading: isAdminLoading, checkAdminRole } = useAdminRole();
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Re-check admin role whenever user changes (login/logout)
  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user, checkAdminRole]);

  // Show loading while auth or admin role is being checked
  if (loading || (user && isAdminLoading)) {
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
