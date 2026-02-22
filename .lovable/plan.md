
## Correcao: Verificacao de Pagamento Falha Apos Retorno do Stripe

### Problema raiz

Existem 3 falhas encadeadas:

1. **Sessao perdida apos redirect do Stripe**: Quando o usuario volta do checkout do Stripe para `/subscription-success`, a pagina faz um fresh load. O `supabase.auth.getSession()` retorna `null` porque o localStorage ainda nao reidratou a sessao. O codigo falha imediatamente com "Sessao expirada" sem sequer chamar o `verify-checkout`.

2. **verify-checkout exige autenticacao desnecessariamente**: A funcao usa `validateAuth(req)` para obter o user_id, mas essa informacao ja esta nos metadados da sessao Stripe (`session.metadata.user_id`). Nao ha necessidade de autenticacao aqui.

3. **check-subscription nao consulta o Stripe como fallback**: Quando o banco diz "expired" mas o Stripe tem uma assinatura ativa, o sistema nao detecta isso.

### Evidencias

- `verify-checkout`: **zero logs** no servidor (nunca foi chamado)
- Stripe: assinatura `sub_1T3eWj1UfMJqJ1ycnKSpApxw` com status **active** para `cus_U1hwWPoH9oPEET`
- Banco: subscription com status `expired`, sem `stripe_customer_id` nem `stripe_subscription_id`

### Solucao

| Arquivo | O que muda |
|---------|-----------|
| `supabase/functions/verify-checkout/index.ts` | Remover necessidade de autenticacao. Obter user_id dos metadados da sessao Stripe em vez do token JWT. |
| `supabase/config.toml` | Adicionar `verify_jwt = false` para `verify-checkout`. |
| `src/components/subscription/SubscriptionSuccess.tsx` | Adicionar retentativas com delay (3 tentativas, 2s de intervalo). Tentar `refreshSession()` antes de desistir. Mostrar botao "Tentar Novamente" em caso de erro. |
| `supabase/functions/check-subscription/index.ts` | Quando o banco diz `expired`, fazer uma consulta ao Stripe como fallback para detectar assinaturas ativas nao sincronizadas. Se encontrar, atualizar o banco automaticamente. |

### Correcao imediata dos dados

O usuario `rafjsmatos@gmail.com` sera desbloqueado atualizando a tabela `subscriptions` com os dados do Stripe:
- `status`: active
- `stripe_customer_id`: cus_U1hwWPoH9oPEET
- `stripe_subscription_id`: sub_1T3eWj1UfMJqJ1ycnKSpApxw
- `subscription_ends_at`: data do `current_period_end` da assinatura

### Detalhes tecnicos

**verify-checkout - antes:**
```text
Request → validateAuth(req) → FALHA (sem token) → erro 401
```

**verify-checkout - depois:**
```text
Request → extrair session_id do body → buscar sessao no Stripe → obter user_id dos metadados → atualizar banco → sucesso
```

A funcao `verify-checkout` nao precisa de autenticacao porque:
- O `session_id` do Stripe so e gerado apos um checkout valido
- O `user_id` esta nos metadados da sessao (definido no `create-checkout`)
- A funcao so faz UPDATE na subscription do usuario correspondente

**SubscriptionSuccess - logica de retry:**
```text
Tentativa 1 → falha? → espera 2s
Tentativa 2 → falha? → espera 2s
Tentativa 3 → falha? → mostra erro + botao "Tentar Novamente"
```

**check-subscription - fallback Stripe:**
```text
1. Buscar subscription no banco
2. Se status = 'expired':
   a. Buscar email do usuario
   b. Buscar customer no Stripe pelo email
   c. Se encontrar assinatura ativa no Stripe:
      - Atualizar banco com dados do Stripe
      - Retornar status 'active'
```

Isso resolve tanto o problema imediato (usuario bloqueado) quanto previne que aconteca novamente no futuro.
