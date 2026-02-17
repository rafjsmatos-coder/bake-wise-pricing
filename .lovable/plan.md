

## Adicionar Status "Orcamento" e Corrigir Filtro da Lista de Compras

### Problema atual

1. O status `ready` (Pronto) esta sendo incluido na lista de compras, mas se o produto ja esta pronto, os materiais ja foram consumidos
2. Nao existe forma de registrar orcamentos sem que eles afetem a lista de compras e o planejamento

### Solucao

Adicionar o status "Orcamento" (quote) como primeiro estagio do ciclo de vida do pedido, e corrigir o filtro da lista de compras.

### Fluxo atualizado dos pedidos

```text
Orcamento -> Pendente -> Em producao -> Pronto -> Entregue
                                                   (Cancelado em qualquer etapa)
```

### Regra da lista de compras

| Status | Aparece na lista de compras |
|--------|----------------------------|
| Orcamento (quote) | Nao |
| Pendente (pending) | Sim |
| Em producao (in_production) | Sim |
| Pronto (ready) | Nao |
| Entregue (delivered) | Nao |
| Cancelado (cancelled) | Nao |

Somente pedidos com status `pending` ou `in_production` afetam a lista de compras, pois sao os que ainda precisam de materiais.

---

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/orders/OrderStatusBadge.tsx` | Adicionar `quote` ao `statusConfig`, `ORDER_STATUSES` e `getStatusColor` com label "Orcamento" e cor cinza/neutra |
| `src/components/orders/ShoppingList.tsx` | Corrigir filtro: incluir apenas `pending` e `in_production` (atualmente exclui so `cancelled` e `delivered`, deixando `ready` entrar) |
| `src/components/orders/OrderForm.tsx` | Adicionar "Orcamento" como opcao no select de status |
| `src/components/orders/OrderCard.tsx` | Nenhuma alteracao necessaria (ja usa `OrderStatusBadge` que sera atualizado) |
| `src/components/orders/OrdersList.tsx` | Verificar se filtros de status incluem a nova opcao |
| `src/hooks/useOrders.tsx` | Ao duplicar pedido, manter status default como `pending` (nao muda) |

### Detalhe tecnico

**OrderStatusBadge.tsx** - Adicionar ao statusConfig:
```text
quote: { label: 'Orcamento', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
```

E ao ORDER_STATUSES (como primeiro item):
```text
{ value: 'quote', label: 'Orcamento' }
```

**ShoppingList.tsx** - Mudar o filtro de:
```text
if (!o.delivery_date || o.status === 'cancelled' || o.status === 'delivered') return false;
```

Para:
```text
if (!o.delivery_date || !['pending', 'in_production'].includes(o.status)) return false;
```

Isso garante que somente pedidos pendentes ou em producao entrem na lista de compras, excluindo orcamentos, prontos, entregues e cancelados.

### Nenhuma migracao de banco necessaria

O campo `status` na tabela `orders` e do tipo `text`, entao aceita qualquer valor sem precisar de migracao.

