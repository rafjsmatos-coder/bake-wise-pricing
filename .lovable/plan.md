

# Modulos Clientes e Pedidos - PreciBake

## Visao Geral

Criar dois modulos interligados: **Clientes** (cadastro completo com endereco, contato e observacoes) e **Pedidos** (vinculados a clientes e produtos, com controle de status, pagamento e calendario de entregas).

---

## Modulo 1: Clientes

### Tabela `clients`

| Coluna | Tipo | Obrigatorio | Descricao |
|--------|------|-------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| user_id | uuid | Sim | Dono do registro (confeiteiro) |
| name | text | Sim | Nome completo do cliente |
| phone | text | Nao | Telefone principal |
| email | text | Nao | Email do cliente |
| address | text | Nao | Rua/numero |
| neighborhood | text | Nao | Bairro |
| city | text | Nao | Cidade |
| state | text | Nao | Estado |
| zip_code | text | Nao | CEP |
| instagram | text | Nao | Perfil Instagram |
| whatsapp | text | Nao | Numero WhatsApp |
| notes | text | Nao | Observacoes (alergias, preferencias, restricoes) |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

RLS: Cada usuario ve/edita/exclui somente seus proprios clientes (user_id = auth.uid()).

### Interface do Cliente

- **Lista de clientes**: Cards com nome, telefone, WhatsApp e badges indicando total de pedidos
- **Busca e filtro**: Campo de busca por nome/telefone
- **Formulario**: Dialog responsivo (full screen no mobile) com campos organizados em grid
- **Detalhes**: Dialog mostrando todas as informacoes do cliente + historico de pedidos vinculados
- **Acoes no card**: Ver, Editar, Excluir (padrao visual existente)

### Arquivos do modulo Clientes

- `src/hooks/useClients.tsx` - Hook com CRUD completo (React Query + Supabase)
- `src/components/clients/ClientsList.tsx` - Pagina principal com lista e filtros
- `src/components/clients/ClientCard.tsx` - Card do cliente
- `src/components/clients/ClientForm.tsx` - Formulario de criacao/edicao
- `src/components/clients/ClientDetails.tsx` - Visualizacao detalhada + historico de pedidos

---

## Modulo 2: Pedidos

### Tabela `orders`

| Coluna | Tipo | Obrigatorio | Descricao |
|--------|------|-------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| user_id | uuid | Sim | Dono do registro |
| client_id | uuid (FK clients) | Sim | Cliente vinculado |
| status | text | Sim | pending, in_production, ready, delivered, cancelled |
| payment_status | text | Sim | pending, partial, paid |
| delivery_date | timestamptz | Nao | Data/hora de entrega |
| total_amount | numeric | Sim default 0 | Valor total do pedido |
| paid_amount | numeric | Sim default 0 | Valor ja pago |
| notes | text | Nao | Observacoes do pedido |
| created_at | timestamptz | Sim | Data de criacao |
| updated_at | timestamptz | Sim | Data de atualizacao |

### Tabela `order_items`

| Coluna | Tipo | Obrigatorio | Descricao |
|--------|------|-------------|-----------|
| id | uuid (PK) | Sim | Identificador unico |
| order_id | uuid (FK orders) | Sim | Pedido vinculado |
| product_id | uuid (FK products) | Sim | Produto selecionado |
| quantity | numeric | Sim default 1 | Quantidade |
| unit_price | numeric | Sim | Preco unitario (editavel) |
| total_price | numeric | Sim | Preco total do item |
| notes | text | Nao | Observacoes do item |
| created_at | timestamptz | Sim | Data de criacao |

RLS para ambas: user_id = auth.uid() no `orders`, e `order_items` usa EXISTS no `orders` (mesmo padrao de product_recipes).

### Interface de Pedidos

#### Lista de Pedidos
- Cards com: nome do cliente, data de entrega, status (badge colorido), status de pagamento, valor total
- Filtros: por status, por cliente, por data, busca por texto
- Ordenacao: por data de entrega (mais proximo primeiro)

#### Calendario de Pedidos
- Visao mensal mostrando os pedidos posicionados nas datas de entrega
- Cada dia mostra quantos pedidos tem e badges com status
- Clicar em um dia mostra os pedidos daquele dia
- Cores por status: Pendente (amarelo), Em producao (azul), Pronto (verde), Entregue (cinza), Cancelado (vermelho)

#### Formulario de Pedido
- Selecionar cliente (combobox com busca, padrao existente dos seletores)
- Adicionar produtos com quantidade e preco (preco sugerido pre-preenchido do calculo de custo, editavel)
- Data e horario de entrega (DatePicker + campo de hora)
- Status do pedido (select)
- Controle de pagamento: status + valor pago
- Observacoes gerais

#### Detalhes do Pedido
- Header com nome do cliente, status, data de entrega
- Tabela de itens com produto, quantidade, preco unitario, total
- Resumo financeiro: subtotal, total, valor pago, saldo restante
- Botoes: Editar, Alterar Status, Registrar Pagamento

### Arquivos do modulo Pedidos

- `src/hooks/useOrders.tsx` - Hook com CRUD de pedidos + itens
- `src/components/orders/OrdersList.tsx` - Pagina principal com lista e filtros
- `src/components/orders/OrderCard.tsx` - Card de pedido
- `src/components/orders/OrderForm.tsx` - Formulario completo de pedido
- `src/components/orders/OrderDetails.tsx` - Visualizacao detalhada
- `src/components/orders/OrderCalendar.tsx` - Calendario visual de entregas
- `src/components/orders/OrderStatusBadge.tsx` - Badge de status reutilizavel
- `src/components/orders/ProductSelector.tsx` - Seletor de produtos para o pedido

---

## Integracao com o Sistema

### Navegacao (AppLayout.tsx)

Adicionar dois novos itens no menu lateral, logo apos "Produtos":

```text
Dashboard
Produtos > Categorias
Receitas > Categorias
--> Clientes (icone: Users)
--> Pedidos (icone: ClipboardList)
Ingredientes > Categorias
Decoracoes > Categorias
Embalagens > Categorias
Configuracoes
Novidades
Suporte
```

### Dashboard (DashboardHome.tsx)

- Adicionar card de resumo: "Clientes" e "Pedidos" nos summary cards
- Adicionar acoes rapidas: "Novo Cliente" e "Novo Pedido"
- Adicionar card de "Proximas Entregas" mostrando os 5 pedidos mais proximos

### Busca Global (GlobalSearch.tsx)

- Incluir clientes e pedidos nos resultados da busca global (Ctrl+K)

### Pagina Dashboard (Dashboard.tsx)

- Registrar as 3 novas paginas: `clients`, `orders`, `order-calendar`

---

## Detalhes Tecnicos

### Calendario de Pedidos

O calendario sera implementado com componentes React puros (sem biblioteca externa), usando um grid de 7 colunas (dias da semana) com calculo de dias do mes. Cada celula mostra pontos coloridos representando os pedidos daquele dia. Navegacao por mes com setas.

### Seletor de Produtos no Pedido

Seguira o padrao dos seletores existentes (RecipeSelector, IngredientSelector):
- Combobox com busca para selecionar produto
- Campos de quantidade e preco unitario (pre-preenchido com preco sugerido)
- Calculo automatico do preco total do item
- Lista de itens adicionados com opcao de remover

### Controle de Pagamento

O campo `payment_status` sera calculado automaticamente:
- `pending`: paid_amount = 0
- `partial`: paid_amount > 0 e paid_amount < total_amount
- `paid`: paid_amount >= total_amount

No formulario, o usuario informa o valor pago e o status e calculado.

### Migracao SQL

Uma unica migracao criara:
1. Tabela `clients` com RLS
2. Tabela `orders` com RLS
3. Tabela `order_items` com RLS (via EXISTS em orders)
4. Trigger para atualizar `updated_at` nas tabelas clients e orders
5. Indice em `orders.delivery_date` para performance do calendario

---

## Resumo de Arquivos

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | Novo | Tabelas clients, orders, order_items + RLS |
| `src/hooks/useClients.tsx` | Novo | Hook CRUD clientes |
| `src/hooks/useOrders.tsx` | Novo | Hook CRUD pedidos + itens |
| `src/components/clients/ClientsList.tsx` | Novo | Lista de clientes |
| `src/components/clients/ClientCard.tsx` | Novo | Card de cliente |
| `src/components/clients/ClientForm.tsx` | Novo | Formulario cliente |
| `src/components/clients/ClientDetails.tsx` | Novo | Detalhes + historico |
| `src/components/orders/OrdersList.tsx` | Novo | Lista de pedidos |
| `src/components/orders/OrderCard.tsx` | Novo | Card de pedido |
| `src/components/orders/OrderForm.tsx` | Novo | Formulario pedido |
| `src/components/orders/OrderDetails.tsx` | Novo | Detalhes do pedido |
| `src/components/orders/OrderCalendar.tsx` | Novo | Calendario visual |
| `src/components/orders/OrderStatusBadge.tsx` | Novo | Badge de status |
| `src/components/orders/ProductSelector.tsx` | Novo | Seletor de produtos |
| `src/components/layout/AppLayout.tsx` | Editar | Novos itens no menu |
| `src/components/dashboard/DashboardHome.tsx` | Editar | Cards + acoes + entregas |
| `src/components/search/GlobalSearch.tsx` | Editar | Incluir clientes/pedidos |
| `src/pages/Dashboard.tsx` | Editar | Registrar novas paginas |

### Sequencia de Implementacao

1. Migracao SQL (tabelas + RLS)
2. Hook useClients + componentes de Clientes
3. Hook useOrders + componentes de Pedidos
4. Calendario de Entregas
5. Integracao: menu, dashboard, busca global

