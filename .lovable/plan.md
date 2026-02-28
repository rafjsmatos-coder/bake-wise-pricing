
# Correcao do Fluxo de Boleto + Visibilidade de Status Pendente

## Status: ✅ IMPLEMENTADO

### O que foi feito:

1. **stripe-webhook**: Adicionado `safeStripeDate` para evitar "Invalid time value", handler para `customer.subscription.created`, tratamento de boleto (`payment_status === 'unpaid'` → `pending`), e helper `findUserId` para buscar user_id por metadata ou stripe_customer_id.

2. **check-subscription**: Fallback Stripe expandido para rodar também quando status é `trial`/`pending` com `stripe_customer_id`. Busca todas as subscriptions (não só active/past_due) e prioriza por status.

3. **SubscriptionCard**: UI para `pending` ("Boleto aguardando pagamento") e `past_due` ("Pagamento atrasado" com botão para portal).

### Próximo passo:
- Quando o usuário `anjo.flor12@gmail.com` acessar o app, o fallback vai sincronizar automaticamente com o Stripe.
