-- Adiciona campo para diferenciar ativações manuais de assinaturas do Stripe
ALTER TABLE public.subscriptions 
ADD COLUMN manual_override boolean NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.subscriptions.manual_override IS 'Indica se a assinatura foi ativada manualmente pelo admin (true) ou via Stripe (false)';