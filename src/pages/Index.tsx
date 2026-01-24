import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthForm } from '@/components/auth/AuthForm';
import { LandingPage } from '@/components/landing/LandingPage';
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { Dashboard } from './Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const { canAccessApp, isLoading: subscriptionLoading } = useSubscription();
  const [showAuthForm, setShowAuthForm] = useState(false);

  if (loading || (user && subscriptionLoading)) {
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

  if (!canAccessApp) {
    return <SubscriptionPaywall />;
  }

  return <Dashboard />;
};

export default Index;
