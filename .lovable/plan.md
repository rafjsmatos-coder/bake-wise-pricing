

# Correcao: subscription_ends_at NULL quebrando ciclo de vida premium

## Problema

O campo `subscription_ends_at` esta sendo salvo como NULL tanto no webhook quanto no fallback do check-subscription. Isso causa um loop: a cada verificacao, o sistema marca o usuario como `expired` (porque nao tem data fim), e o fallback Stripe re-sincroniza para `active` (mas sem data novamente).

Isso afeta **cartao e boleto igualmente**.

## Causa raiz

O `safeStripeDate` recebe `stripeSub.current_period_end` mas o Stripe SDK v18+ pode retornar esse campo em formatos diferentes dependendo da versao da API. Preciso investigar o valor exato que chega e corrigir a conversao.

## Correcoes

### 1. `supabase/functions/stripe-webhook/index.ts`

- Melhorar o `safeStripeDate` para aceitar tanto numeros quanto strings ISO
- Adicionar logging do valor raw de `current_period_end` antes da conversao para diagnostico
- Garantir que todos os handlers (invoice.paid, subscription.created/updated, checkout.completed) salvem a data corretamente

### 2. `supabase/functions/check-subscription/index.ts`

- No fallback Stripe, logar o valor raw de `current_period_end` para diagnostico
- Melhorar a conversao de data no fallback (mesma logica do webhook)
- Tratar o caso em que `subscription_ends_at` e null para status `active`: em vez de expirar, rodar o fallback imediatamente

Mudanca na logica de verificacao:
```text
if (subscription.status === 'active') {
  const subEnds = subscription.subscription_ends_at ? new Date(...) : null;
  
  if (subEnds && subEnds > now) {
    canAccess = true;  // Data valida, acesso normal
  } else if (!subEnds && subscription.stripe_subscription_id) {
    // Data null MAS tem subscription no Stripe: 
    // dar acesso e forcar fallback para buscar a data
    canAccess = true;
    shouldFallback = true;  // Forcar fallback para preencher a data
  } else {
    currentStatus = 'expired';
    canAccess = false;
  }
}
```

### 3. Correcao dos dados atuais (one-time fix)

Apos o deploy das correcoes, o proximo check-subscription ou webhook ira preencher automaticamente o `subscription_ends_at` com a data correta do Stripe.

---

## Fluxo corrigido: Ciclo de vida completo

### Cartao de credito
1. Checkout -> `checkout.session.completed` -> status = `active`, `subscription_ends_at` = data fim do periodo
2. A cada renovacao mensal -> `invoice.paid` -> atualiza `subscription_ends_at` para o proximo periodo
3. Se o cartao falha -> `invoice.payment_failed` -> status = `past_due` (3 dias de carencia)
4. Se nao regulariza -> Stripe cancela -> `customer.subscription.deleted` -> status = `expired` -> paywall

### Boleto
1. Checkout -> `checkout.session.completed` com `payment_status: 'unpaid'` -> status = `pending`
2. Boleto compensa -> `invoice.paid` -> status = `active`, `subscription_ends_at` = data fim
3. Proximo mes: Stripe gera novo boleto -> se nao paga -> `invoice.payment_failed` -> `past_due`
4. Se nao paga apos carencia -> Stripe cancela -> `expired` -> paywall

### Em ambos os casos
- Se `subscription_ends_at` passar da data atual sem renovacao -> `expired` -> paywall
- O paywall mostra opcao de assinar novamente

---

## Arquivos alterados

| Arquivo | Acao |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | EDITAR - melhorar safeStripeDate + logging |
| `supabase/functions/check-subscription/index.ts` | EDITAR - tratar subscription_ends_at null para active |

---

## Checklist de testes

- Verificar que apos deploy, o usuario `anjo.flor12` tem `subscription_ends_at` preenchido (nao null)
- Confirmar nos logs que `current_period_end` esta sendo logado corretamente
- Verificar que o loop fallback para de acontecer (so roda se realmente expirou)
- Testar que quando o periodo premium acaba de fato, o paywall aparece corretamente
