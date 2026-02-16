

## Plano Completo: Redesign de Navegacao + Padronizacao Visual

Este plano unifica duas frentes de trabalho: (1) a reestruturacao completa da navegacao para uma experiencia moderna de SaaS e (2) a padronizacao visual de todas as paginas para consistencia absoluta em smartphones, tablets e desktops.

---

### PARTE 1: Redesign da Navegacao e Layout

#### Problema atual

- No mobile, o unico caminho para navegar e o hamburger menu - lento e frustrante
- 12 itens no sidebar com submenus colapsaveis sobrecarregam o usuario
- Header mobile mostra apenas logo + hamburger, sem titulo da pagina nem acoes rapidas
- Sem barra de navegacao inferior (padrao de apps modernos como iFood, Nubank)
- Categorias repetidas como submenus em 5 modulos diferentes

#### 1.1 - Bottom Navigation Bar (Mobile)

Criar `src/components/layout/BottomNav.tsx` com 5 abas fixas no rodape:

```text
+--------+--------+--------+--------+--------+
|  Home  |Produtos| Pedidos|  $$$   |  Mais  |
|   []   |   []   |   []   |   []   |   []   |
+--------+--------+--------+--------+--------+
```

- **Home**: Dashboard
- **Produtos**: Navega para Produtos
- **Pedidos**: Navega para Pedidos
- **Financeiro**: Navega para Fluxo de Caixa
- **Mais**: Abre drawer/tela com itens secundarios

Detalhes tecnicos:
- `fixed bottom-0` com `z-50`, visivel apenas em `lg:hidden`
- `pb-[env(safe-area-inset-bottom)]` para iPhones com notch
- Icones de 24px com label de 10px, item ativo com cor `accent`
- Main recebe `pb-20 lg:pb-0` para nao ficar atras da barra

#### 1.2 - Menu "Mais" (Mobile)

Criar `src/components/layout/MoreMenu.tsx` como uma pagina/drawer com os itens secundarios:

- Ingredientes, Receitas, Decoracoes, Embalagens
- Clientes, Lista de Compras
- Relatorios, Contas a Receber
- Configuracoes, Novidades, Suporte
- Perfil, Sair

#### 1.3 - Header Mobile Contextual

Reformular o header no `AppLayout.tsx`:

```text
+----------------------------------------------+
|  [<]  Ingredientes (24)    [Busca] [Avatar]  |
+----------------------------------------------+
```

- Titulo da pagina atual com contagem de itens
- Botao de busca (lupa) que abre o `GlobalSearch`
- Avatar pequeno (32px) para acesso rapido ao perfil
- Seta voltar quando em subpaginas
- O hamburger menu e removido no mobile (substituido pelo bottom nav)

#### 1.4 - Sidebar Desktop Reorganizada

Reorganizar os itens em grupos visuais com separadores (`<Separator />`):

```text
PRINCIPAL
  Dashboard
  Produtos
  Receitas
  Pedidos
  Clientes

MATERIAIS
  Ingredientes
  Decoracoes
  Embalagens

FINANCEIRO
  Fluxo de Caixa
  Relatorios
  Contas a Receber

---
  Configuracoes
  Novidades
  Suporte
```

- Labels de grupo em `text-xs uppercase text-muted-foreground`
- Sem Collapsible/submenus - todos os itens sao links diretos planos
- Categorias removidas do sidebar

#### 1.5 - Categorias como Tabs Internas

Em vez de "Produtos > Categorias" como submenu, as categorias ficam dentro da pagina como tabs:

```text
+------------------------------------------+
|  Produtos                    [+ Novo]    |
|  [Todos]  [Categorias]                   |
+------------------------------------------+
```

Aplicar em: ProductsList, RecipesList, IngredientsList, DecorationsList, PackagingList.

Remover do `PageType`: `categories`, `recipe-categories`, `decoration-categories`, `packaging-categories`, `product-categories`. E remover do `Dashboard.tsx` os cases correspondentes.

---

### PARTE 2: Padronizacao Visual de Todas as Paginas

#### 2.1 - Loading States

Padronizar para `min-h-[400px]` em todas as paginas:

| Arquivo | Estado atual | Correcao |
|---------|-------------|----------|
| IngredientsList.tsx | `h-64` | `min-h-[400px]` |
| DecorationsList.tsx | `h-64` | `min-h-[400px]` |
| PackagingList.tsx | `h-64` | `min-h-[400px]` |
| ProductsList.tsx | `h-64` | `min-h-[400px]` |
| ProfileSettings.tsx | verificar | `min-h-[400px]` |

Paginas ja corretas: RecipesList, OrdersList, TransactionsList, SupportPage, UpdatesPage, ReceivablesList.

#### 2.2 - Touch Targets (min-h-[44px])

Padronizar todos os inputs, selects e botoes interativos:

| Arquivo | Elemento | Correcao |
|---------|----------|----------|
| ClientsList.tsx | Input busca | adicionar `min-h-[44px]` |
| OrdersList.tsx | Input busca | `text-base` para `min-h-[44px]` |
| OrdersList.tsx | SelectTrigger | adicionar `min-h-[44px]` |
| TransactionsList.tsx | Input month | adicionar `min-h-[44px]` |
| TransactionsList.tsx | Input busca | adicionar `min-h-[44px]` |
| TransactionsList.tsx | SelectTrigger | adicionar `min-h-[44px]` |
| RevenueReport.tsx | Input month | adicionar `min-h-[44px]` |

#### 2.3 - Headers Padronizados

Todas as paginas seguirao este padrao:

```text
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div className="min-w-0">
    <h1 className="text-2xl font-bold text-foreground truncate">Titulo</h1>
    <p className="text-muted-foreground">X itens cadastrados</p>
  </div>
  <Button className="w-full sm:w-auto shrink-0">...</Button>
</div>
```

Correcoes necessarias:

| Arquivo | Problema |
|---------|----------|
| ClientsList.tsx | Falta `min-w-0`, botao sem `w-full sm:w-auto` |
| OrdersList.tsx | Falta `min-w-0` no div do texto, botao sem `w-full sm:w-auto` |
| TransactionsList.tsx | Falta `min-w-0` |
| SupportPage.tsx | Header usa icone lateral - adaptar ao padrao |
| UpdatesPage.tsx | Header usa icone lateral - adaptar ao padrao |

#### 2.4 - Wrapper Responsivo

Adicionar `max-w-full overflow-x-hidden` no div raiz das paginas que ainda nao tem:

- SupportPage.tsx
- UpdatesPage.tsx
- UserSettings.tsx (verificar)

#### 2.5 - Gap dos Filtros

Padronizar para `gap-3` em todas as secoes de filtro:

| Arquivo | Estado atual | Correcao |
|---------|-------------|----------|
| RecipesList.tsx | `gap-4` | `gap-3` |
| DecorationsList.tsx | `gap-4` | `gap-3` |

---

### Resumo de Arquivos

| Arquivo | Alteracoes |
|---------|-----------|
| **src/components/layout/BottomNav.tsx** | **NOVO** - Barra de navegacao inferior mobile |
| **src/components/layout/MoreMenu.tsx** | **NOVO** - Pagina/drawer "Mais" com itens secundarios |
| **src/components/layout/AppLayout.tsx** | Reformular header mobile (titulo + busca + avatar), reorganizar sidebar com grupos planos, remover submenus de categorias, integrar BottomNav, ajustar padding do main |
| **src/pages/Dashboard.tsx** | Remover PageTypes de categorias, remover cases do switch, integrar GlobalSearch no header |
| **src/components/products/ProductsList.tsx** | Loading `min-h-[400px]`, adicionar tab "Categorias" que renderiza ProductCategoriesList |
| **src/components/recipes/RecipesList.tsx** | Gap `gap-3`, adicionar tab "Categorias" |
| **src/components/ingredients/IngredientsList.tsx** | Loading `min-h-[400px]`, adicionar tab "Categorias" |
| **src/components/decorations/DecorationsList.tsx** | Loading `min-h-[400px]`, gap `gap-3`, adicionar tab "Categorias" |
| **src/components/packaging/PackagingList.tsx** | Loading `min-h-[400px]`, adicionar tab "Categorias" |
| **src/components/clients/ClientsList.tsx** | Header `min-w-0`, botao `w-full sm:w-auto`, input `min-h-[44px]` |
| **src/components/orders/OrdersList.tsx** | Header `min-w-0`, botao `w-full sm:w-auto`, input `min-h-[44px]`, select `min-h-[44px]` |
| **src/components/financial/TransactionsList.tsx** | Header `min-w-0`, inputs `min-h-[44px]`, select `min-h-[44px]` |
| **src/components/financial/RevenueReport.tsx** | Input month `min-h-[44px]` |
| **src/components/support/SupportPage.tsx** | Wrapper `max-w-full overflow-x-hidden`, padronizar header |
| **src/components/updates/UpdatesPage.tsx** | Wrapper `max-w-full overflow-x-hidden`, padronizar header |
| **src/components/settings/ProfileSettings.tsx** | Loading `min-h-[400px]` se necessario |
| **src/index.css** | Adicionar safe-area-inset para bottom nav em iPhones |

### Resultado Esperado

- **Mobile**: Navegacao por toque com 1 clique para 80% das funcoes (bottom bar) + header informativo com titulo e busca
- **Tablet**: Sidebar colapsavel + bottom bar
- **Desktop**: Sidebar organizada em grupos claros sem submenus confusos
- **Todas as paginas**: Loading uniforme, touch targets de 44px, headers identicos, sem scroll horizontal, gaps consistentes
- **Categorias**: Integradas dentro de cada pagina como tabs, nao como itens separados na navegacao

