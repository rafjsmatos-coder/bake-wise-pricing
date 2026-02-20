

## Busca Global: Navegar direto para o item buscado

### Problema

Quando voce busca "manga" e clica no resultado, o sistema apenas abre a pagina de ingredientes sem filtrar. Voce precisa rolar a lista toda para achar o item. Isso acontece porque o `GlobalSearch` so envia o nome da pagina (`'ingredients'`), sem informar qual item foi clicado.

### Solucao

Passar o termo de busca da `GlobalSearch` para o `Dashboard`, que por sua vez repassa para cada componente de lista. Assim, ao clicar em "Manga" na busca, a lista de ingredientes ja abre com "manga" preenchido no campo de busca, mostrando o item no topo.

### Como vai funcionar para voce

1. Abrir a busca (Ctrl+K ou pelo icone)
2. Digitar "manga"
3. Clicar no resultado "Manga"
4. A pagina de ingredientes abre com "manga" ja digitado no filtro de busca
5. Apenas o item "Manga" aparece na lista, sem precisar rolar

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/search/GlobalSearch.tsx` | `handleSelect` passa tambem o nome do item clicado junto com a pagina. O callback `onNavigate` muda para `onNavigate(page, searchTerm)`. |
| `src/pages/Dashboard.tsx` | Novo estado `searchFilter` que armazena o termo vindo da busca. Cada componente de lista recebe `initialSearch={searchFilter}`. Quando o usuario muda de pagina normalmente (pelo menu), o filtro e limpo. |
| `src/components/ingredients/IngredientsList.tsx` | Aceita prop `initialSearch?: string` e usa como valor inicial do campo de busca local. |
| `src/components/recipes/RecipesList.tsx` | Mesma mudanca: aceita `initialSearch` como valor inicial do filtro. |
| `src/components/products/ProductsList.tsx` | Mesma mudanca. |
| `src/components/decorations/DecorationsList.tsx` | Mesma mudanca. |
| `src/components/packaging/PackagingList.tsx` | Mesma mudanca. |
| `src/components/clients/ClientsList.tsx` | Mesma mudanca. |
| `src/components/orders/OrdersList.tsx` | Mesma mudanca. |

### Detalhes tecnicos

**Fluxo atual:**
```text
GlobalSearch.handleSelect('ingredients') → Dashboard.setCurrentPage('ingredients') → IngredientsList() com busca vazia
```

**Fluxo corrigido:**
```text
GlobalSearch.handleSelect('ingredients', 'manga') → Dashboard.setCurrentPage('ingredients') + setSearchFilter('manga') → IngredientsList(initialSearch='manga') → campo de busca ja preenchido, lista filtrada
```

**Mudanca no GlobalSearch:**
- Cada `CommandItem` ja tem o nome do item (ex: `ingredient.name`). Ao clicar, o `onSelect` envia `(page, itemName)`.

**Mudanca nas listas:**
- Cada lista recebe `initialSearch?: string` como prop.
- O `useState` de busca usa `initialSearch` como valor default.
- Um `useEffect` monitora mudancas no `initialSearch` para atualizar o campo quando o usuario faz uma nova busca global.

**Mudanca no Dashboard:**
- `handleSearchNavigate(page, searchTerm)` seta ambos `currentPage` e `searchFilter`.
- `handlePageChange(page)` (navegacao pelo menu) limpa o `searchFilter`.
- Cada componente recebe `initialSearch={searchFilter}` apenas quando a pagina corresponde.

