import { Bell, BellOff, Package, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = usePushNotifications();

  if (isLoading) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg flex items-center justify-center min-h-[100px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <BellOff className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Notificações Push</h2>
            <p className="text-sm text-muted-foreground">
              Seu navegador não suporta notificações push. Tente usar o Chrome ou instale o app (PWA).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">Notificações Push</h2>
            <p className="text-sm text-muted-foreground">
              Receba alertas sobre entregas, estoque e pagamentos.
            </p>
          </div>
        </div>
        <Button
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          onClick={isSubscribed ? unsubscribe : subscribe}
        >
          {isSubscribed ? 'Desativar' : 'Ativar'}
        </Button>
      </div>

      {isSubscribed && (
        <div className="space-y-3 animate-fade-in pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tipos de alerta</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="notify-deliveries" className="text-sm cursor-pointer">
                Entregas do dia
              </Label>
            </div>
            <Switch
              id="notify-deliveries"
              checked={preferences.notify_deliveries}
              onCheckedChange={(checked) => updatePreferences({ notify_deliveries: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="notify-stock" className="text-sm cursor-pointer">
                Estoque baixo
              </Label>
            </div>
            <Switch
              id="notify-stock"
              checked={preferences.notify_stock}
              onCheckedChange={(checked) => updatePreferences({ notify_stock: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="notify-payments" className="text-sm cursor-pointer">
                Pagamentos pendentes
              </Label>
            </div>
            <Switch
              id="notify-payments"
              checked={preferences.notify_payments}
              onCheckedChange={(checked) => updatePreferences({ notify_payments: checked })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
