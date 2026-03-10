import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PushPreferences {
  notify_deliveries: boolean;
  notify_stock: boolean;
  notify_payments: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<PushPreferences>({
    notify_deliveries: true,
    notify_stock: true,
    notify_payments: true,
  });

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (!supported || !user?.id) {
      setIsLoading(false);
      return;
    }
    checkSubscription();
  }, [user?.id]);

  const checkSubscription = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (data) {
        setIsSubscribed(true);
        setPreferences({
          notify_deliveries: data.notify_deliveries,
          notify_stock: data.notify_stock,
          notify_payments: data.notify_payments,
        });
      } else {
        setIsSubscribed(false);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const getVapidPublicKey = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-vapid-keys');
      if (error || !data?.publicKey) return null;
      return data.publicKey;
    } catch {
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!user?.id || !isSupported) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão de notificação negada');
        return;
      }

      // Register push service worker
      const registration = await navigator.serviceWorker.register('/sw-push.js', { scope: '/push/' });
      await navigator.serviceWorker.ready;

      // Get VAPID public key from edge function
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        toast.error('Erro ao obter chave VAPID. Tente novamente.');
        return;
      }

      // Convert base64url to Uint8Array
      const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
      const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        applicationServerKey[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const json = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth_key: json.keys!.auth,
        notify_deliveries: preferences.notify_deliveries,
        notify_stock: preferences.notify_stock,
        notify_payments: preferences.notify_payments,
      }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notificações ativadas!');
    } catch (err: any) {
      console.error('Push subscription error:', err);
      toast.error('Erro ao ativar notificações');
    }
  }, [user?.id, isSupported, preferences]);

  const unsubscribe = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Remove from database
      await supabase.from('push_subscriptions').delete().eq('user_id', user.id);

      // Unsubscribe from push manager
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.scope.includes('/push/')) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) await sub.unsubscribe();
          await reg.unregister();
        }
      }

      setIsSubscribed(false);
      toast.success('Notificações desativadas');
    } catch {
      toast.error('Erro ao desativar notificações');
    }
  }, [user?.id]);

  const updatePreferences = useCallback(async (newPrefs: Partial<PushPreferences>) => {
    if (!user?.id) return;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update(updated)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch {
      toast.error('Erro ao salvar preferências');
    }
  }, [user?.id, preferences]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
}
