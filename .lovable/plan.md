

# Melhorias de Pedidos + Novos Modulos

## 1. Corrigir Dialog de Pedido "se movendo" no mobile

O problema persiste porque o `overscroll-behavior: contain` nao e suficiente -- o dialog do Radix usa `translate-x-[-50%] translate-y-[-50%]` com posicionamento central que permite scroll lateral. A solucao e aplicar `touch-action: none` no overlay e `overflow-x: hidden` no DialogContent, alem de garantir que o conteudo nao ultrapasse a largura do dialog.

Arquivos:
- `src/components/orders/OrderForm.tsx` -- adicionar `overflow-x-hidden` e CSS inline `touchAction: 'pan-y'` no DialogContent

---

## 2. Duplicar Pedido

Adicionar botao "Duplicar" no card de pedido e nos detalhes. Ao clicar, cria um novo pedido com os mesmos dados (cliente, itens, precos, observacoes) mas com status "pendente", pagamento zerado e sem data de entrega.

Arquivos:
- `src/hooks/useOrders.tsx` -- adicionar mutacao `duplicateOrder`
- `src/components/orders/OrderCard.tsx` -- adicionar botao Duplicar (icone Copy)
- `src/components/orders/OrderDetails.tsx` -- adicionar botao Duplicar no header
- `src/components/orders/OrdersList.tsx` -- adicionar handler `handleDuplicate`

---

## 3. Baixa de Estoque (Sugestao + Confirmacao)

Conforme a estrategia definida: ao marcar um pedido como "Entregue", o sistema apresenta um dialog de confirmacao listando todos os materiais (ingredientes, decoracoes e embalagens) necessarios para produzir os itens do pedido. O usuario revisa a lista e confirma quais itens deseja descontar do estoque.

### Fluxo

```text
Pedido marcado como "Entregue"
        |
        v
Dialog "Baixa de Estoque"
  - Lista materiais calculados a partir dos produtos do pedido
  - Cada item com checkbox (todos marcados por padrao)
  - Mostra: nome, quantidade a descontar, estoque atual
  - Botoes: "Confirmar Baixa" / "Pular"
        |
        v
Atualiza stock_quantity nos registros selecionados
```

### Calculo dos materiais

Para cada item do pedido:
1. Buscar o produto e seus componentes (receitas, ingredientes diretos, decoracoes, embalagens)
2. Para cada receita do produto, buscar os ingredientes da receita
3. Multiplicar quantidades pela quantidade do pedido
4. Agregar materiais repetidos

Arquivos:
- `src/components/orders/StockDeductionDialog.tsx` -- novo componente com lista de materiais e checkboxes
- `src/hooks/useOrders.tsx` -- adicionar logica para buscar materiais e atualizar estoque
- `src/components/orders/OrderDetails.tsx` -- integrar dialog quando status muda para "delivered"
- `src/components/orders/OrdersList.tsx` -- integrar dialog no fluxo de mudanca de status

---

## 4. Lista de Compras Automatica

Gerar uma lista de compras baseada nos pedidos da semana (ou periodo selecionavel). Agrega todos os ingredientes, decoracoes e embalagens necessarios, mostrando:
- Nome do material
- Quantidade total necessaria
- Estoque atual
- Quantidade a comprar (necessario - estoque)

### Interface

Uma nova pagina "Lista de Compras" acessivel pelo menu lateral (dentro de Pedidos como sub-item ou como pagina independente). Possui:
- Seletor de periodo (esta semana, proxima semana, customizado)
- Lista agrupada por tipo (Ingredientes, Decoracoes, Embalagens)
- Apenas itens que precisam ser comprados (estoque insuficiente) com opcao de mostrar todos
- Botao para compartilhar via WhatsApp (mensagem formatada)

Arquivos:
- `src/components/orders/ShoppingList.tsx` -- novo componente com a lista
- `src/pages/Dashboard.tsx` -- registrar nova pagina `shopping-list`
- `src/components/layout/AppLayout.tsx` -- adicionar item no menu (sub-item de Pedidos)

---

## 5. Modulo Financeiro

### 5A. Fluxo de Caixa (Entradas e Saidas)

Tabela `financial_transactions` para registrar movimentacoes manuais:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador |
| user_id | uuid | Dono |
| type | text | 'income' ou 'expense' |
| category | text | Categoria (ex: "Material", "Aluguel", "Venda avulsa") |
| description | text | Descricao da movimentacao |
| amount | numeric | Valor |
| date | date | Data da movimentacao |
| order_id | uuid (FK, nullable) | Vinculo opcional com pedido |
| created_at | timestamptz | Criacao |

RLS: user_id = auth.uid()

Quando um pedido for pago (total ou parcialmente), o sistema sugere registrar automaticamente como entrada no fluxo de caixa.

### 5B. Relatorio de Faturamento

Tela com:
- Filtro por periodo (mes atual, mes anterior, trimestre, customizado)
- Card com total faturado (pedidos entregues + pagos no periodo)
- Card com total de despesas registradas
- Card com lucro (faturamento - despesas)
- Grafico de barras mensal (usando Recharts, ja instalado)
- Lista dos top 5 produtos mais vendidos no periodo
- Lista dos top 5 clientes por faturamento

### 5C. Contas a Receber

Tela/card mostrando:
- Pedidos com saldo pendente (paid_amount < total_amount)
- Ordenados por data de entrega (mais antigos primeiro = mais urgentes)
- Total a receber
- Botao rapido para registrar pagamento parcial ou total
- Destaque visual para pedidos vencidos (entregues mas nao pagos totalmente)

### Interface do Modulo Financeiro

Nova secao "Financeiro" no menu lateral com sub-paginas:
- Fluxo de Caixa (lista de transacoes + formulario + saldo)
- Relatorios (graficos + metricas)
- Contas a Receber (lista de pendencias)

Arquivos:
- Migracao SQL -- tabela `financial_transactions` + RLS
- `src/hooks/useFinancial.tsx` -- Hook CRUD de transacoes + queries de relatorios
- `src/components/financial/TransactionsList.tsx` -- Lista de transacoes com filtros
- `src/components/financial/TransactionForm.tsx` -- Formulario de entrada/saida
- `src/components/financial/RevenueReport.tsx` -- Relatorios com graficos
- `src/components/financial/ReceivablesList.tsx` -- Contas a receber
- `src/pages/Dashboard.tsx` -- registrar paginas financeiras
- `src/components/layout/AppLayout.tsx` -- adicionar menu "Financeiro" com sub-itens

---

## Resumo de Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `OrderForm.tsx` | Editar | Fix mobile swipe/movement |
| `useOrders.tsx` | Editar | Adicionar duplicateOrder + logica de estoque |
| `OrderCard.tsx` | Editar | Botao duplicar |
| `OrderDetails.tsx` | Editar | Botao duplicar + integracao baixa estoque |
| `OrdersList.tsx` | Editar | Handlers duplicar + baixa estoque |
| `StockDeductionDialog.tsx` | Novo | Dialog de confirmacao de baixa de estoque |
| `ShoppingList.tsx` | Novo | Lista de compras automatica |
| Migracao SQL | Novo | Tabela financial_transactions + RLS |
| `useFinancial.tsx` | Novo | Hook financeiro |
| `TransactionsList.tsx` | Novo | Fluxo de caixa |
| `TransactionForm.tsx` | Novo | Formulario de transacao |
| `RevenueReport.tsx` | Novo | Relatorios com graficos |
| `ReceivablesList.tsx` | Novo | Contas a receber |
| `AppLayout.tsx` | Editar | Menu Financeiro + Lista de Compras |
| `Dashboard.tsx` | Editar | Registrar novas paginas |

### Sequencia de Implementacao

1. Fix mobile do OrderForm
2. Duplicar pedido
3. Baixa de estoque (dialog + logica)
4. Lista de compras automatica
5. Modulo financeiro (tabela + fluxo de caixa + relatorios + contas a receber)

