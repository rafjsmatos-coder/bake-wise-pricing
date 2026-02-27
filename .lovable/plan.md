
# P0-4: Tratamento past_due/incomplete + P1-3: Webhook Stripe

## Resumo

Duas mudancas complementares: (1) o webhook do Stripe para sincronizacao em tempo real de eventos de assinatura, e (2) tratamento correto dos status `past_due` e `incomplete` em todo o fluxo.

---

## 1. Migracoes no banco de dados

### 1a. Adicionar `past_due` ao enum `subscription_status`

O enum atual so tem: `trial`, `active`, `canceled`, `expired`, `pending`. Precisamos adicionar `past_due`.

```text
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due';
```

**Nota:** `incomplete` do Stripe sera mapeado para `pending` no banco local (ja existe), pois o comportamento e o mesmo: aguardando pagamento.

### 1b. Criar tabela `webhook_events` para idempotencia

Webhooks do Stripe podem ser enviados mais de uma vez. Precisamos de uma tabela para registrar eventos ja processados:

```text
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS habilitado mas sem policies (acesso somente via service role)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Limpeza automatica de eventos antigos (> 30 dias)
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed_at);
```

---

## 2. Nova Edge Function: `stripe-webhook`

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

**Configuracao em config.toml:**
```text
[functions.stripe-webhook]
verify_jwt = false
```

**Eventos tratados:**

| Evento Stripe | Acao no banco |
|---|---|
| `invoice.paid` | status = `active`, atualiza `subscription_ends_at` |
| `invoice.payment_failed` | status = `past_due` |
| `customer.subscription.updated` | sincroniza status (active/past_due/canceled) e datas |
| `customer.subscription.deleted` | status = `expired` |
| `checkout.session.completed` | status = `active` ou `pending` (boleto) |

**Logica principal:**

1. Verificar assinatura do webhook usando `STRIPE_WEBHOOK_SECRET` (ja configurado nos secrets)
2. Checar idempotencia na tabela `webhook_events` -- se ja processou, retornar 200
3. Extrair `user_id` dos metadados da subscription (definido no `create-checkout` via `subscription_data.metadata`)
4. Se nao encontrar `user_id` nos metadados, buscar pelo `stripe_customer_id` na tabela `subscriptions`
5. Atualizar tabela `subscriptions` conforme o evento
6. Registrar evento na tabela `webhook_events`
7. Retornar 200

**Mapeamento de status Stripe para local:**

```text
Stripe "active"    -> local "active"
Stripe "past_due"  -> local "past_due"
Stripe "canceled"  -> local "canceled"
Stripe "unpaid"    -> local "expired"
Stripe "incomplete" -> local "pending"
Stripe "incomplete_expired" -> local "expired"
```

---

## 3. Atualizar `check-subscription` (Edge Function)

Adicionar tratamento do status `past_due`:

```text
} else if (subscription.status === 'past_due') {
  // Carencia de 3 dias para boleto: permitir acesso
  const subEnds = subscription.subscription_ends_at
    ? new Date(subscription.subscription_ends_at)
    : null;
  
  if (subEnds) {
    const gracePeriodEnd = new Date(subEnds.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (gracePeriodEnd > now) {
      canAccess = true;
      daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000*60*60*24));
    } else {
      canAccess = false;
      currentStatus = 'expired';
      // Atualizar banco
    }
  } else {
    canAccess = false;
  }
}
```

No fallback Stripe (quando status e `expired`), tambem buscar subscriptions com status `past_due`:

```text
const subscriptions = await stripe.subscriptions.list({
  customer: customerId,
  limit: 1,
});
// Verificar se tem active OU past_due
```

---

## 4. Atualizar Frontend

### 4a. `useSubscription.tsx`

Adicionar `past_due` ao tipo `SubscriptionStatus`:

```text
type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled' | 'pending' | 'past_due' | 'loading';
```

### 4b. `SubscriptionPaywall.tsx`

Nenhuma mudanca necessaria -- `past_due` com acesso permitido nao mostra paywall. Se o acesso for negado apos a carencia, o status ja sera `expired`.

### 4c. `DashboardHome.tsx` (card de status)

Adicionar mensagem para `past_due`:

```text
"Pagamento pendente - regularize para evitar interrupcao"
```

Com um botao "Gerenciar Assinatura" que abre o Customer Portal.

### 4d. `TrialBanner` ou card equivalente no Dashboard

Exibir alerta amarelo quando status for `past_due` informando que o pagamento falhou e dando link para o portal.

---

## 5. Decisao sobre Boleto Recorrente

**Politica de carencia para `past_due`:**
- **3 dias de carencia apos `subscription_ends_at`** -- o usuario mantem acesso
- Apos 3 dias, status muda para `expired` e acesso e bloqueado
- Isso cobre o cenario de boleto recorrente onde o usuario pode levar 1-2 dias uteis para pagar

**Justificativa:** Stripe ja trata boleto recorrente como `past_due` quando o boleto nao e pago ate o vencimento. 3 dias e suficiente para compensacao bancaria sem dar acesso excessivo a inadimplentes.

---

## 6. Arquivos alterados (resumo)

| Arquivo | Acao |
|---|---|
| Migracao SQL | Adicionar `past_due` ao enum + criar tabela `webhook_events` |
| `supabase/config.toml` | Adicionar `[functions.stripe-webhook] verify_jwt = false` |
| `supabase/functions/stripe-webhook/index.ts` | CRIAR -- processar webhooks do Stripe |
| `supabase/functions/check-subscription/index.ts` | EDITAR -- tratar `past_due` com carencia |
| `src/hooks/useSubscription.tsx` | EDITAR -- adicionar tipo `past_due` |
| `src/components/dashboard/DashboardHome.tsx` | EDITAR -- alerta de pagamento pendente |

---

## 7. Configuracao necessaria no Stripe Dashboard

Apos o deploy, sera necessario configurar a URL do webhook no Stripe:

```text
URL: https://ektodtogznnlwvcsawgu.supabase.co/functions/v1/stripe-webhook
Eventos: invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, checkout.session.completed
```

O secret `STRIPE_WEBHOOK_SECRET` ja esta configurado nos secrets do projeto.

---

## 8. Checklist de testes

- Webhook: enviar evento `invoice.paid` via Stripe CLI e verificar que o banco atualiza para `active`
- Webhook: enviar `invoice.payment_failed` e verificar status `past_due` no banco
- Webhook: enviar `customer.subscription.deleted` e verificar status `expired`
- Idempotencia: enviar o mesmo evento duas vezes e verificar que so processa uma
- Carencia: usuario com `past_due` dentro de 3 dias tem `canAccess: true`
- Carencia expirada: usuario com `past_due` apos 3 dias tem `canAccess: false` e status `expired`
- Dashboard: card de alerta amarelo aparece quando status e `past_due`
- Fallback Stripe: `check-subscription` detecta subscription `past_due` no Stripe e sincroniza
