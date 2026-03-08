

## Analise do Tour - Erros Encontrados

### Problemas identificados

**1. `data-tour="today-deliveries"` -- elemento condicional**
O card "Entregas Hoje" so renderiza quando existem pedidos para hoje (`if (todayOrders.length === 0) return null`). Se nao ha pedidos, o elemento nao existe no DOM e o step 3 aponta para o nada -- o popover flutua deslocado (visivel no print IMG_1204).

**2. `data-tour="stock-alerts"` -- elemento condicional**
O `data-tour="stock-alerts"` so esta no Card de alertas (linha 153). Quando nao ha alertas, o componente retorna o card "Tudo OK" (linha 136) **sem** `data-tour`. Resultado: step 4 tambem aponta para elemento inexistente (visivel no print IMG_1205 -- popover deslocado no canto).

**3. Duplicacao de texto entre mobile e desktop**
Os steps de Pedidos, Financeiro e Produtos tem conteudo identico nos dois roteiros. No mobile deveria dizer "Toque" em vez de "Clique", e as dicas poderiam ser mais curtas.

### Plano de correcao

| Arquivo | Mudanca |
|---------|---------|
| `src/components/dashboard/DashboardHome.tsx` | Envolver a secao de entregas do dia em uma `div` com `data-tour="today-deliveries"` que **sempre renderiza**, mesmo quando vazia (o card condicional fica dentro) |
| `src/components/dashboard/StockAlertsCard.tsx` | Adicionar `data-tour="stock-alerts"` tambem no card "Tudo OK" (linha 136), para que o tour sempre encontre o elemento |

Essas duas correcoes garantem que os steps 3 e 4 sempre encontram um elemento no DOM, independente de haver pedidos ou alertas.

