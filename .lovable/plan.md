

## Auditoria Completa: Busca Global, Cards, Formularios e Filtros

Apos analise detalhada de todos os componentes, aqui esta o diagnostico e as melhorias propostas.

---

### 1. BUSCA GLOBAL - O que falta

A busca atual cobre: Produtos, Receitas, Ingredientes, Decoracoes, Embalagens e Clientes. Porem ha lacunas:

| O que falta | Impacto |
|-------------|---------|
| **Pedidos** nao sao buscaveis | Usuario nao encontra pedidos por nome de cliente ou produto |
| **Transacoes financeiras** nao sao buscaveis | Nao localiza entradas/saidas por descricao |
| Ao selecionar um item, navega para a **pagina da listagem** (ex: "products") em vez de abrir o **item especifico** | Usuario precisa buscar novamente na pagina de destino |
| Busca so filtra por **nome** (exceto clientes que buscam phone/email) | Nao busca por marca, fornecedor ou categoria |

**Melhorias propostas:**
- Adicionar grupo "Pedidos" na busca global (busca por nome do cliente e produtos do pedido)
- Adicionar grupo "Transacoes" na busca global (busca por descricao e categoria)
- Expandir busca de ingredientes/decoracoes/embalagens para incluir **marca** e **fornecedor**
- Expandir busca de clientes para incluir **whatsapp** e **instagram**

---

### 2. CARDS - Inconsistencias encontradas

| Componente | Problema | Correcao |
|------------|----------|----------|
| **IngredientCard** | Falta botoes "Ver" (Eye) e "Duplicar" (Copy) - tem so Editar e Excluir | Adicionar Eye + Copy para consistencia com ProductCard e RecipeCard |
| **DecorationCard** | Falta botoes "Ver" (Eye) e "Duplicar" (Copy) | Adicionar Eye + Copy |
| **PackagingCard** | Falta botoes "Ver" (Eye) e "Duplicar" (Copy) | Adicionar Eye + Copy |
| **DecorationCard** | Nao exibe fornecedor (`supplier`) | Adicionar exibicao de fornecedor |
| **PackagingCard** | Nao exibe fornecedor (`supplier`) | Adicionar exibicao de fornecedor |

Os cards de **ProductCard**, **RecipeCard**, **OrderCard** e **ClientCard** ja estao bem padronizados com os 4 botoes de acao (Eye, Copy, Pencil, Trash).

**Padrao de botoes a seguir em todos os cards:**
```text
[Ver] [Duplicar] [Editar] [Excluir]
 Eye    Copy     Pencil   Trash
```

---

### 3. FORMULARIOS - Analise

Os formularios estao bem construidos. Todos usam:
- `min-h-[44px]` nos inputs (touch targets)
- `DialogContent` com `max-h-[100dvh]` no mobile e `sm:max-h-[90vh]` no desktop
- Grids responsivos `grid-cols-1 sm:grid-cols-2`
- Botoes com `min-h-[44px]` e layout `flex-col-reverse sm:flex-row`

**Nao ha correcoes necessarias nos formularios.**

---

### 4. FILTROS DAS LISTAGENS - O que falta

| Pagina | Filtros atuais | O que falta |
|--------|---------------|-------------|
| **Ingredientes** | Busca por nome/marca/fornecedor + Categoria | **Filtro "Sem categoria"** ja existe. Completo. |
| **Receitas** | Busca por nome + Categoria | Falta opcao **"Sem categoria"** no filtro de categorias |
| **Produtos** | Busca por nome + Categoria | Completo (ja tem "Sem categoria") |
| **Decoracoes** | Busca por nome/marca + Categoria | Completo (ja tem "Sem categoria") |
| **Embalagens** | Busca por nome/marca/fornecedor + Categoria | Completo |
| **Pedidos** | Busca por cliente/produto + Status | Falta filtro de **pagamento** (pago/parcial/pendente) e filtro de **periodo** (mes/data) |
| **Clientes** | Busca por nome/telefone/email | Falta filtro de **cidade/estado** |
| **Fluxo de Caixa** | Mes + Busca + Tipo (entrada/saida) | Falta filtro por **categoria** da transacao |
| **Contas a Receber** | Nenhum filtro | Falta **busca** por nome do cliente e filtro de **periodo** |

---

### Plano de Implementacao

#### Fase 1: Busca Global melhorada
**Arquivo:** `src/components/search/GlobalSearch.tsx`
- Importar `useOrders` e `useFinancial`
- Adicionar grupo "Pedidos" buscando por `client.name` e `order_items.product.name`
- Adicionar grupo "Transacoes" buscando por `description` e `category`
- Expandir filtro de ingredientes para incluir `brand` e `supplier`
- Expandir filtro de decoracoes para incluir `supplier`
- Expandir filtro de clientes para incluir `whatsapp`

#### Fase 2: Padronizacao dos Cards
**Arquivos:** `IngredientCard.tsx`, `DecorationCard.tsx`, `PackagingCard.tsx`
- Adicionar botoes `Eye` (Ver) e `Copy` (Duplicar) em todos os cards que nao tem
- Adicionar exibicao de `supplier` onde relevante
- Atualizar interfaces dos cards para receber `onView` e `onDuplicate`

**Arquivos:** `IngredientsList.tsx`, `DecorationsList.tsx`, `PackagingList.tsx`
- Atualizar as lists para passar as novas props `onView` e `onDuplicate` aos cards
- Adicionar funcao `duplicateIngredient`/`duplicateDecoration` nos hooks se nao existirem

**Arquivos:** hooks correspondentes (`useIngredients.tsx`, `useDecorations.tsx`, `usePackaging.tsx`)
- Adicionar mutation `duplicate` se ainda nao existir

#### Fase 3: Filtros aprimorados
**Arquivo:** `src/components/recipes/RecipesList.tsx`
- Adicionar opcao "Sem categoria" no SelectContent de categorias

**Arquivo:** `src/components/orders/OrdersList.tsx`
- Adicionar filtro de **status de pagamento** (todos/pago/parcial/pendente)
- Adicionar filtro de **periodo** (mes) com input type="month"

**Arquivo:** `src/components/clients/ClientsList.tsx`
- Adicionar filtro de **cidade/estado** via Select

**Arquivo:** `src/components/financial/TransactionsList.tsx`
- Adicionar filtro por **categoria** da transacao via Select

**Arquivo:** `src/components/financial/ReceivablesList.tsx`
- Adicionar **campo de busca** por nome do cliente

---

### Resumo de Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|-----------|
| `src/components/search/GlobalSearch.tsx` | Adicionar Pedidos e Transacoes, expandir filtros de busca |
| `src/components/ingredients/IngredientCard.tsx` | Adicionar botoes Ver e Duplicar |
| `src/components/decorations/DecorationCard.tsx` | Adicionar botoes Ver e Duplicar, exibir fornecedor |
| `src/components/packaging/PackagingCard.tsx` | Adicionar botoes Ver e Duplicar |
| `src/components/ingredients/IngredientsList.tsx` | Passar novas props aos cards |
| `src/components/decorations/DecorationsList.tsx` | Passar novas props aos cards |
| `src/components/packaging/PackagingList.tsx` | Passar novas props aos cards |
| `src/hooks/useIngredients.tsx` | Adicionar mutation `duplicateIngredient` se nao existir |
| `src/hooks/useDecorations.tsx` | Adicionar mutation `duplicateDecoration` se nao existir |
| `src/hooks/usePackaging.tsx` | Adicionar mutation `duplicatePackaging` se nao existir |
| `src/components/recipes/RecipesList.tsx` | Adicionar "Sem categoria" no filtro |
| `src/components/orders/OrdersList.tsx` | Adicionar filtros de pagamento e periodo |
| `src/components/clients/ClientsList.tsx` | Adicionar filtro de cidade/estado |
| `src/components/financial/TransactionsList.tsx` | Adicionar filtro por categoria |
| `src/components/financial/ReceivablesList.tsx` | Adicionar campo de busca |

