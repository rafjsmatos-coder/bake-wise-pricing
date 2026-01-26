

# Correção do Webhook do Stripe e Ativação Manual da Assinatura

## Problema Identificado

O pagamento foi processado com sucesso no Stripe, mas o webhook não conseguiu atualizar o banco de dados porque está usando a função síncrona `constructEvent()` em vez da versão assíncrona `constructEventAsync()` necessária no Deno.

### Dados Confirmados

| Item | Valor |
|------|-------|
| Cliente Stripe | cus_TrhAEG8dR80dqb |
| Assinatura Stripe | sub_1Stxm41UfMJqJ1ycr2FCHmGT |
| Status no Stripe | **active** |
| Status no Banco | trial (não atualizado) |

### Erro nos Logs

```text
SubtleCryptoProvider cannot be used in a synchronous context.
Use `await constructEventAsync(...)` instead of `constructEvent(...)`
```

---

## Solução em 2 Partes

### Parte 1: Atualização Manual do Banco de Dados

Atualizar imediatamente o registro de assinatura do usuário para refletir o status correto:

```sql
UPDATE subscriptions
SET 
  status = 'active',
  stripe_customer_id = 'cus_TrhAEG8dR80dqb',
  stripe_subscription_id = 'sub_1Stxm41UfMJqJ1ycr2FCHmGT',
  stripe_product_id = 'prod_TrfaAKNLqC8XfO',
  subscription_start = now(),
  updated_at = now()
WHERE user_id = '881da8e6-e4af-4e25-9138-1094c0c25e71';
```

### Parte 2: Correção do Webhook

Alterar a linha 44 do arquivo `supabase/functions/stripe-webhook/index.ts`:

```typescript
// ANTES (linha 44):
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

// DEPOIS:
event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
```

---

## Impacto

| Ação | Resultado |
|------|-----------|
| Atualização manual | Sua assinatura será ativada imediatamente |
| Correção do webhook | Futuros pagamentos serão processados corretamente |

---

## Próximos Passos Após Aprovação

1. Executar UPDATE no banco para ativar sua assinatura
2. Corrigir o webhook para usar `constructEventAsync`
3. Re-deploiar a Edge Function
4. Você poderá fazer logout e login novamente para ver o status "Ativo"

