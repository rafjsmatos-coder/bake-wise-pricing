
-- Adicionar past_due ao enum subscription_status
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due';

-- Criar tabela webhook_events para idempotência
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS habilitado mas sem policies (acesso somente via service role)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Index para limpeza de eventos antigos
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed_at);
