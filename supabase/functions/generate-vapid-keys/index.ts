import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  const origin = req.headers.get('origin');
  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' };

  try {
    // Generate VAPID keys using Web Crypto API
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

    // Convert to URL-safe base64
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const privateKeyBase64 = privateKeyJwk.d!;

    return new Response(JSON.stringify({
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
      message: 'Save these as VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets'
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
