import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// JWT creation for VAPID
async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: 'mailto:suporte@precibake.com.br',
  };

  const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  // Import private key
  const privateKeyBytes = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const publicKeyBytes = Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const jwk = {
    kty: 'EC', crv: 'P-256',
    d: VAPID_PRIVATE_KEY,
    x: btoa(String.fromCharCode(...publicKeyBytes.slice(1, 33))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
    y: btoa(String.fromCharCode(...publicKeyBytes.slice(33, 65))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
  };

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsignedToken));
  
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${unsignedToken}.${sigBase64}`;
}

async function sendPush(subscription: { endpoint: string; p256dh: string; auth_key: string }, payload: string) {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: payload,
    });

    if (response.status === 410 || response.status === 404) {
      return { expired: true };
    }
    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error('Push send error:', error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  const origin = req.headers.get('origin');
  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' };

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500, headers });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    // Get all subscriptions
    const { data: subscriptions } = await supabase.from('push_subscriptions').select('*');
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ message: 'No subscriptions' }), { headers });
    }

    // Group subscriptions by user
    const userSubs = new Map<string, typeof subscriptions>();
    subscriptions.forEach(sub => {
      const existing = userSubs.get(sub.user_id) || [];
      existing.push(sub);
      userSubs.set(sub.user_id, existing);
    });

    let sent = 0;
    const expiredIds: string[] = [];

    for (const [userId, subs] of userSubs) {
      const notifications: string[] = [];

      // Check deliveries today
      const wantsDeliveries = subs.some(s => s.notify_deliveries);
      if (wantsDeliveries) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .neq('status', 'cancelled')
          .neq('status', 'delivered')
          .gte('delivery_date', todayStart)
          .lte('delivery_date', todayEnd);
        
        if (count && count > 0) {
          notifications.push(`📦 Você tem ${count} entrega${count > 1 ? 's' : ''} para hoje!`);
        }
      }

      // Check low stock
      const wantsStock = subs.some(s => s.notify_stock);
      if (wantsStock) {
        const { data: lowStock } = await supabase
          .from('ingredients')
          .select('name, stock_quantity, min_stock_alert')
          .eq('user_id', userId)
          .eq('is_active', true)
          .not('min_stock_alert', 'is', null)
          .not('stock_quantity', 'is', null);

        const alerts = lowStock?.filter(i => 
          i.stock_quantity !== null && i.min_stock_alert !== null && 
          i.stock_quantity <= i.min_stock_alert
        ) || [];

        if (alerts.length > 0) {
          notifications.push(`⚠️ ${alerts.length} ingrediente${alerts.length > 1 ? 's' : ''} com estoque baixo`);
        }
      }

      // Check pending payments
      const wantsPayments = subs.some(s => s.notify_payments);
      if (wantsPayments) {
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('total_amount, paid_amount, discount')
          .eq('user_id', userId)
          .neq('status', 'cancelled')
          .neq('payment_status', 'paid');

        const totalPending = pendingOrders?.reduce((sum, o) => {
          const effective = o.total_amount - (o.discount || 0);
          return sum + (effective - o.paid_amount);
        }, 0) || 0;

        if (totalPending > 0) {
          const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending);
          notifications.push(`💰 ${formatted} em pagamentos pendentes`);
        }
      }

      if (notifications.length === 0) continue;

      const payload = JSON.stringify({
        title: 'PreciBake',
        body: notifications.join('\n'),
        icon: '/icon-192.png',
        badge: '/favicon-48.png',
      });

      for (const sub of subs) {
        const result = await sendPush(sub, payload);
        if (result.expired) {
          expiredIds.push(sub.id);
        } else if (result.success) {
          sent++;
        }
      }
    }

    // Cleanup expired subscriptions
    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    return new Response(JSON.stringify({ sent, expired: expiredIds.length }), { headers });
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
