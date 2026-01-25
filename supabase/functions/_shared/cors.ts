// SECURITY: CORS configuration with allowed origins
// Restricts cross-origin requests to known domains for defense-in-depth

const ALLOWED_ORIGINS = [
  'https://bake-wise-pricing.lovable.app',
  'https://id-preview--c0021bd6-83d4-45de-aa94-e9d690844ef1.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response(null, { headers: getCorsHeaders(origin) });
  }
  return null;
}
