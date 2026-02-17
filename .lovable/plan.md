

## Corrigir Limpeza Automatica do manual_override

### Problema

Quando o admin ativa manualmente um trial ou premium, o campo `manual_override` e marcado como `true`. Porem, quando esse periodo manual expira, o `check-subscription` muda o status para `expired` mas NAO limpa o `manual_override`. Isso deixa o usuario num estado inconsistente onde:

- O acesso esta corretamente bloqueado (as datas sao verificadas)
- Mas o "Sincronizar Stripe" no admin nao funciona porque ve `manual_override: true` e nao mexe no usuario
- O admin perde visibilidade sobre o real motivo do status

### Solucao

Atualizar a edge function `check-subscription` para limpar `manual_override` quando um periodo manual expira naturalmente.

| Arquivo | Alteracao |
|---------|----------|
| `supabase/functions/check-subscription/index.ts` | Adicionar `manual_override: false` nos dois pontos onde o status e atualizado para `expired` (trial expirado na linha ~109 e assinatura expirada na linha ~126) |

### Detalhe tecnico

Nos dois blocos onde o status e atualizado para `expired`, mudar de:

```text
.update({ status: 'expired' })
```

Para:

```text
.update({ status: 'expired', manual_override: false })
```

Isso acontece em dois locais:
1. Linha ~109: quando `status === 'trial'` e `trial_ends_at` ja passou
2. Linha ~126: quando `status === 'active'` e `subscription_ends_at` ja passou

### Resultado

```text
Fluxo corrigido:

Admin estende trial 15 dias
  -> manual_override: true, status: trial

15 dias depois, check-subscription detecta expiracao
  -> manual_override: false, status: expired

Admin pode agora sincronizar com Stripe normalmente
  -> Stripe sync funciona sem bloqueio do override
```

### Nenhuma outra alteracao necessaria

O resto do sistema ja funciona corretamente:
- `syncFromStripe` ja limpa `manual_override` quando encontra assinatura ativa no Stripe
- O admin ja pode definir `manual_override` via `updateSubscription`
- A aba de Assinatura no modal ja mostra o estado do override

