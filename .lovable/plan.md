

# Correções: Baixa de Estoque + Melhorias Admin

## 1. Bug da Baixa de Estoque

### Problema Identificado

Quando o usuario muda o status para "Entregue" a partir do dialog de **Detalhes do Pedido**, o dialog de detalhes permanece aberto enquanto o dialog de baixa de estoque tenta abrir por cima. Dois dialogs sobrepostos causam conflito -- o de baixa de estoque pode ficar escondido, bloqueado ou simplesmente nao aparecer.

### Solucao

1. **Fechar o dialog de detalhes antes de abrir o de baixa de estoque**: No `OrdersList.tsx`, quando `handleStatusChange` detecta status "delivered", fechar o `detailsOpen` primeiro e usar um pequeno delay (setTimeout) para abrir o dialog de baixa de estoque, garantindo que o DOM limpe o dialog anterior.

2. **Garantir que o order completo (com order_items) seja passado**: Atualmente o `stockDeductionOrder` vem de `orders.find()`, que ja inclui `order_items`. Mas vamos adicionar uma verificacao extra para garantir.

Arquivo: `src/components/orders/OrdersList.tsx`

```text
const handleStatusChange = (orderId: string, status: string) => {
  // Fechar detalhes primeiro para evitar conflito de dialogs
  setDetailsOpen(false);
  
  updateOrderStatus.mutate({ id: orderId, status }, {
    onSuccess: () => {
      if (status === 'delivered') {
        const order = orders.find((o) => o.id === orderId);
        if (order && order.order_items && order.order_items.length > 0) {
          // Pequeno delay para garantir que o dialog anterior fechou
          setTimeout(() => {
            setStockDeductionOrder(order);
            setStockDeductionOpen(true);
          }, 300);
        }
      }
    },
  });
};
```

---

## 2. Melhorias no Admin

O painel administrativo ja possui as funcionalidades essenciais (estatisticas, gestao de usuarios com controle de assinatura, suporte e novidades). Para esta fase, vamos adicionar melhorias incrementais:

### 2A. Estatisticas de Assinatura no Dashboard Admin

O `AdminStats` ja busca dados de assinatura (`subscriptionStats`) mas **nao exibe** esses dados na interface. Vamos adicionar cards mostrando:
- Usuarios em Trial
- Usuarios Premium (ativos)
- Usuarios Expirados
- Total de assinaturas

Arquivo: `src/components/admin/AdminStats.tsx` -- adicionar cards de assinatura usando os dados que ja vem do backend (`stats.subscriptions`)

### 2B. Contagem de Pedidos e Clientes por Usuario (Detalhes)

O `UserDetailsModal` ja mostra contagem de ingredientes, receitas, produtos, embalagens e decoracoes. Vamos adicionar tambem:
- Contagem de pedidos
- Contagem de clientes

Arquivo: `supabase/functions/admin-users/index.ts` -- adicionar queries de contagem para `orders` e `clients` no case `getUserDetails`
Arquivo: `src/components/admin/UserDetailsModal.tsx` -- exibir as novas contagens

---

## Resumo de Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `OrdersList.tsx` | Editar | Fechar dialog de detalhes antes de abrir baixa de estoque + delay |
| `AdminStats.tsx` | Editar | Exibir cards de assinatura |
| `admin-users/index.ts` | Editar | Adicionar contagem de pedidos e clientes |
| `UserDetailsModal.tsx` | Editar | Exibir contagens de pedidos e clientes |

### Sequencia

1. Fix bug da baixa de estoque (OrdersList)
2. Cards de assinatura no AdminStats
3. Contagens extras no UserDetailsModal + edge function

