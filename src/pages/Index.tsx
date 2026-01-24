import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthForm } from '@/components/auth/AuthForm';
import { SubscriptionPaywall } from '@/components/subscription/SubscriptionPaywall';
import { Dashboard } from './Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const { canAccessApp, isLoading: subscriptionLoading } = useSubscription();

  if (loading || (user && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!canAccessApp) {
    return <SubscriptionPaywall />;
  }

  return <Dashboard />;
};

export default Index;
