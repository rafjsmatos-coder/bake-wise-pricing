
-- Add WhatsApp message template columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN whatsapp_quote_template text DEFAULT 'Olá {cliente}! Segue o orçamento do seu pedido:

{itens}
{total}{entrega}{observacoes}

Obrigado(a) pela preferência! 🎂',
  ADD COLUMN whatsapp_confirmation_template text DEFAULT 'Olá {cliente}! ✅

Seu pedido foi *confirmado*!{entrega}

Obrigado(a) pela confiança! 🎂',
  ADD COLUMN whatsapp_reminder_template text DEFAULT 'Olá {cliente}! 😊

Lembrando que a entrega do seu pedido está marcada para *{data_entrega}*.

{itens}

Alguma dúvida, é só me chamar! 🎂';
