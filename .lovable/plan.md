
# Correcao do Fluxo de Boleto + Visibilidade de Status Pendente

## Diagnostico

Analisei os logs e o banco de dados. Encontrei os seguintes problemas:

### 1. Webhook com erro "Invalid time value"
O evento `checkout.session.completed` foi recebido mas falhou com "Invalid time value". Isso acontece porque ao pagar via boleto, a subscription do Stripe comeca com status `incomplete` e o campo `current_period_end` pode nao estar disponivel da forma esperada. O codigo tenta `new Date(stripeSub.current_period_end * 1000)` e falha.

### 2. Evento `customer.subscription.created` nao tratado
O webhook recebeu o evento `customer.subscription.created` (esta na tabela `webhook_events`), mas o codigo nao tem esse case no switch -- cai no `default` e nao faz nada.

### 3. Assinatura no banco ainda esta como `trial`
Por causa dos dois erros acima, a assinatura do usuario `anjo.flor12@gmail.com` nunca foi atualizada para `pending` (boleto aguardando) ou `active` (apos pagamento).

### 4. Fallback do check-subscription limitado
O fallback Stripe em `check-subscription` so busca subscriptions `active` ou `past_due`, mas nao busca `incomplete` (boleto pendente). Alem disso, so roda quando status local e `expired`, e o usuario esta como `trial`.

### 5. Falta visibilidade do boleto pendente
O `SubscriptionCard` mostra badge "Pendente" mas nao da informacoes uteis sobre o boleto.

---

## Plano de Correcao

### Arquivo 1: `supabase/functions/stripe-webhook/index.ts`

**Correcoes:**

1. Adicionar tratamento do evento `customer.subscription.created` -- sincronizar status e datas
2. Corrigir o bug de "Invalid time value" no `checkout.session.completed` -- verificar se `current_period_end` existe antes de converter, e tratar subscriptions incompletas (boleto)
3. Adicionar tratamento seguro de datas em todos os handlers -- usar funcao helper que valida antes de criar Date

```text
// Helper seguro para converter timestamp Stripe
function safeStripeDate(timestamp: number | undefined | null): string | null {
  if (!timestamp || isNaN(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}
```

4. No `checkout.session.completed`, tratar o caso de `payment_status === 'unpaid'` (boleto) definindo status como `pending`

### Arquivo 2: `supabase/functions/check-subscription/index.ts`

**Correcoes:**

1. Adicionar tratamento do status `pending` -- nao dar acesso mas manter o status correto
2. Expandir o fallback Stripe para tambem buscar subscriptions `incomplete` e `trialing`, alem de `active` e `past_due`
3. Rodar o fallback tambem quando status local e `trial` E a subscription tem `stripe_customer_id` (significa que ja fez checkout)

### Arquivo 3: `src/components/subscription/SubscriptionCard.tsx`

**Melhorias de UI:**

1. Adicionar caso `pending` nas informacoes de expiracao -- mostrar mensagem "Boleto aguardando pagamento"
2. Adicionar caso `past_due` nas informacoes -- mostrar alerta de pagamento atrasado com botao para o portal
3. Destacar visualmente o estado pendente com cor amarela

### Arquivo 4: `src/hooks/useSubscription.tsx`

**Pequeno ajuste:**

1. Garantir que `pending` esta no tipo `SubscriptionStatus` (ja esta, apenas confirmar)

---

## Sobre sua pergunta do boleto

Quando o usuario paga via boleto no Stripe:

1. `checkout.session.completed` dispara com `payment_status: 'unpaid'` -- boleto gerado mas nao pago
2. O Stripe envia `invoice.paid` quando o boleto e compensado (1-2 dias uteis)
3. O webhook `invoice.paid` atualiza o status para `active`

**O que acontecera apos as correcoes:**
- Ao gerar o boleto: status muda para `pending`, usuario ve "Boleto aguardando pagamento" no dashboard
- Ao pagar o boleto: webhook `invoice.paid` atualiza para `active`, usuario ve "Premium Ativo"
- Se o boleto nao for pago: o Stripe cancela automaticamente e o webhook atualiza para `expired`

**Para o pagamento que voce ja fez:** Apos o deploy, o `check-subscription` vai detectar via fallback Stripe que a assinatura esta ativa e sincronizar automaticamente.

---

## Checklist de testes

- Verificar que apos deploy, o usuario `anjo.flor12` aparece como `active` (se boleto ja foi pago no Stripe)
- Testar novo checkout com boleto: status deve mudar para `pending` imediatamente
- Verificar que SubscriptionCard mostra "Boleto aguardando pagamento" quando status e `pending`
- Confirmar que webhook `invoice.paid` atualiza corretamente para `active`
- Verificar que o alerta `past_due` aparece corretamente no dashboard
