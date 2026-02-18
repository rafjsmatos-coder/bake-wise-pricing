

## Correcoes: Pedidos lentos ao salvar + Financeiro nao atualiza

### Problemas encontrados

#### 1. Financeiro NAO atualiza (BUG CRITICO - query key errada)

Este e o bug principal. Quando o pedido e salvo, o `onSuccess` do `useOrders` invalida:

```
queryClient.invalidateQueries({ queryKey: ['financial'] })
```

Porem, o `useFinancial` registra a query com a chave:

```
queryKey: ['financial-transactions', user?.id]
```

A chave `'financial'` NAO corresponde a `'financial-transactions'`. Por isso a invalidacao nao faz efeito e o usuario precisa fechar e reabrir o app para ver os dados atualizados.

**Correcao**: Alterar todas as chamadas de `invalidateQueries` no `useOrders` para usar a chave correta `['financial-transactions']`.

#### 2. Edicao lenta (5-6 chamadas sequenciais ao banco)

Ao editar um pedido, o `updateOrder` faz todas estas chamadas em sequencia (uma esperando a outra terminar):

1. `update orders` - atualiza o pedido
2. `delete order_items` - remove itens antigos
3. `insert order_items` - insere itens novos
4. `select clients` - busca nome do cliente (para a descricao da transacao)
5. `select financial_transactions` - verifica se ja existe transacao
6. `update/insert financial_transactions` - atualiza ou cria transacao

Chamadas 2+3 podem rodar em paralelo com 4+5, reduzindo o tempo total.

**Correcao**: Paralelizar operacoes independentes usando `Promise.all`.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/hooks/useOrders.tsx` | (1) Corrigir query key de `['financial']` para `['financial-transactions']` em todos os `onSuccess`. (2) Paralelizar chamadas independentes no `updateOrder` com `Promise.all`. |

### Detalhes tecnicos

**Antes (sequencial):**
```text
update order → delete items → insert items → fetch client → check transaction → upsert transaction
[────────────────────────────────────────────────────────────────────────────────────────────────]
                                    ~6 round trips sequenciais
```

**Depois (paralelo):**
```text
update order ──┐
               ├─ await all ─→ delete+insert items ──┐
fetch client ──┘                                      ├─ check+upsert transaction
                                                      │
                                    ~3 round trips efetivos
```

A correcao da query key resolve o problema de nao atualizar. A paralelizacao reduz o tempo de salvamento pela metade.

