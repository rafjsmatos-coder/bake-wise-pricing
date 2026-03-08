

## Plano: Tour Guiado mais completo

### Situacao atual

O tour tem:
- **Mobile**: 5 steps (welcome, cards resumo, nav inferior, menu mais, conclusao)
- **Desktop**: 9 steps (welcome, cards resumo, ingredientes, receitas, produtos, decoracoes, embalagens, configuracoes, conclusao)

Falta cobrir: pedidos, clientes, financeiro, lista de compras, busca global, tema claro/escuro, perfil, entregas do dia, alertas de estoque, e o card de dicas.

### Mudancas

**1. `TourProvider.tsx`** -- Expandir ambos os roteiros

**Desktop** (de 9 para ~15 steps):
1. Welcome (existente)
2. Cards de resumo (existente)
3. Entregas do dia / proximas entregas (novo) -- `[data-tour="today-deliveries"]`
4. Alertas de estoque (novo) -- `[data-tour="stock-alerts"]`
5. Ingredientes (existente)
6. Receitas (existente)
7. Produtos (existente)
8. Decoracoes (existente)
9. Embalagens (existente)
10. Pedidos (novo) -- `[data-tour="nav-orders"]`
11. Clientes (novo) -- `[data-tour="nav-clients"]`
12. Financeiro (novo) -- `[data-tour="nav-financial"]`
13. Lista de Compras (novo) -- `[data-tour="nav-shopping-list"]`
14. Configuracoes (existente, expandir com perfil/tema)
15. Conclusao com dica de fluxo completo (existente, melhorado)

**Mobile** (de 5 para ~10 steps):
1. Welcome (existente)
2. Cards de resumo (existente)
3. Entregas do dia (novo)
4. Alertas de estoque (novo)
5. Botao Dashboard na nav inferior (existente)
6. Botao Produtos (novo) -- `[data-tour="bottom-products"]`
7. Botao Pedidos (novo) -- `[data-tour="bottom-orders"]`
8. Botao Financeiro (novo) -- `[data-tour="bottom-financial"]`
9. Menu Mais (existente, expandir descricao)
10. Conclusao (existente, melhorado)

**2. `DashboardHome.tsx`** -- Adicionar `data-tour` nos cards de entregas e alertas de estoque

**3. `BottomNav.tsx`** -- Adicionar `data-tour` nos botoes individuais (products, orders, cash-flow)

**4. `AppLayout.tsx`** -- Adicionar `data-tour` nos itens de sidebar que faltam (orders, clients, cash-flow, shopping-list)

**5. `StockAlertsCard.tsx`** -- Adicionar `data-tour="stock-alerts"`

### Conteudo dos novos steps (exemplos)

- **Pedidos**: "Gerencie seus pedidos com calendario visual. Controle status, datas de entrega e valores. Gere lista de compras automatica!"
- **Clientes**: "Cadastre seus clientes com telefone e endereco. Ao criar pedidos, selecione o cliente e envie orcamentos pelo WhatsApp."
- **Financeiro**: "Controle entradas e saidas, veja relatorios de faturamento e gerencie contas a receber."
- **Lista de Compras**: "Selecione pedidos e o sistema calcula automaticamente todos os ingredientes que voce precisa comprar."
- **Entregas do dia**: "Aqui aparecem os pedidos com entrega para hoje -- nunca perca um prazo!"
- **Alertas de estoque**: "O sistema avisa quando ingredientes estao com estoque baixo ou com preco desatualizado."

### Arquivos alterados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/tour/TourProvider.tsx` | Expandir steps mobile e desktop |
| `src/components/dashboard/DashboardHome.tsx` | Adicionar data-tour em entregas e alertas |
| `src/components/dashboard/StockAlertsCard.tsx` | Adicionar data-tour |
| `src/components/layout/BottomNav.tsx` | Adicionar data-tour nos botoes individuais |
| `src/components/layout/AppLayout.tsx` | Adicionar data-tour para orders, clients, cash-flow, shopping-list na sidebar |

