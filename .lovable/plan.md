

## Fechar com Chave de Ouro: Assinaturas

Analise completa do sistema de assinaturas revelou 4 pontos a corrigir para deixar tudo blindado.

---

### Correcao 1: extendTrial sem manual_override

**Problema**: Quando o admin estende o trial de um usuario, o campo `manual_override` nao e ativado. Se depois o admin clicar em "Sincronizar Stripe" para esse mesmo usuario, o trial estendido sera revertido para "expirado" porque nao ha assinatura ativa no Stripe.

**Solucao**: Adicionar `manual_override: true` na acao `extendTrial` da edge function `admin-users`.

| Arquivo | Alteracao |
|---------|----------|
| `supabase/functions/admin-users/index.ts` | Adicionar `manual_override: true` no update do `extendTrial` (linha ~472) |

---

### Correcao 2: Detalhes de assinatura invisiveis no admin

**Problema**: O `UserDetailsModal` busca os dados completos da assinatura (status, datas, stripe IDs, manual_override) mas NAO exibe nada disso na interface. O admin so ve perfil e contagem de dados, sem visibilidade sobre a assinatura do usuario.

**Solucao**: Adicionar uma terceira aba "Assinatura" no modal de detalhes com:
- Status atual (badge colorido)
- Data de expiracao do trial
- Data de expiracao da assinatura
- Flag manual_override (sim/nao)
- Stripe Customer ID e Subscription ID (se existirem)

| Arquivo | Alteracao |
|---------|----------|
| `src/components/admin/UserDetailsModal.tsx` | Adicionar tab "Assinatura" com exibicao detalhada dos campos da tabela subscriptions |

---

### Correcao 3: Status "Pendente" ausente nas estatisticas

**Problema**: O grid de stats mostra 4 cards (Trial, Premium, Expirado, Cancelado) mas ignora usuarios com status "Pendente" (boleto aguardando compensacao). O dado ja e calculado no backend mas nao e exibido.

**Solucao**: Expandir o grid para 5 cards, adicionando "Pendente" com icone de relogio amarelo.

| Arquivo | Alteracao |
|---------|----------|
| `src/components/admin/AdminStats.tsx` | Adicionar card "Pendente" ao grid de estatisticas, mudar grid para `grid-cols-5` ou usar layout responsivo adequado |

---

### Correcao 4: Remover stripeCustomerId da resposta do check-subscription

**Problema**: A edge function `check-subscription` retorna o `stripeCustomerId` para o frontend do usuario. Esse dado nao e usado em nenhum lugar do codigo do usuario e representa um vazamento desnecessario de informacao sensivel.

**Solucao**: Remover o campo `stripeCustomerId` da resposta JSON.

| Arquivo | Alteracao |
|---------|----------|
| `supabase/functions/check-subscription/index.ts` | Remover `stripeCustomerId` do JSON de resposta (linha ~147) |

---

### Resumo de arquivos a modificar

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/admin-users/index.ts` | Edge Function - fix extendTrial |
| `supabase/functions/check-subscription/index.ts` | Edge Function - remover dado sensivel |
| `src/components/admin/UserDetailsModal.tsx` | Frontend - adicionar aba Assinatura |
| `src/components/admin/AdminStats.tsx` | Frontend - adicionar card Pendente |

