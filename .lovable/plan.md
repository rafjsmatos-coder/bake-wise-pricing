

## Correcao: Botao de Fechar dos Dialogs + Layout dos Cards

### Problema 1: Botao X sobreposto nos dialogs

O botao de fechar (X) no `DialogContent` usa `absolute right-4 top-4`, ficando em cima dos botoes de acao (Orcamento, Duplicar, Editar) no header dos dialogs. Isso afeta **todos os modulos** que usam Dialog: Pedidos, Produtos, Receitas, Ingredientes, Decoracoes, Embalagens, Clientes.

**Solucao:** Adicionar `pr-10` ao `DialogHeader` no componente base `dialog.tsx`, garantindo que o conteudo do header nunca fique embaixo do X. Adicionalmente, nos dialogs que tem botoes de acao no header (como OrderDetails), reorganizar para que os botoes fiquem **abaixo** do titulo em vez de ao lado.

### Problema 2: Cards com layout quebrado

Na imagem dos Pedidos, o nome "R..." aparece truncado porque os 4 botoes de acao (Eye, Copy, Pencil, Trash) ficam ao lado do titulo, ocupando ~128px e comprimindo o nome. Isso acontece em **todos os cards**: OrderCard, IngredientCard, DecorationCard, PackagingCard, RecipeCard, ProductCard, ClientCard.

**Solucao:** Mover os botoes de acao para uma **linha separada no rodape** do card, em vez de ao lado do titulo. O titulo passa a ocupar 100% da largura, sem truncamento desnecessario.

Novo layout dos cards:
```text
+----------------------------------+
|  [Categoria]                     |
|  Nome do Item Completo           |
|                                  |
|  Informacoes / detalhes          |
|                                  |
|  ---- border ----                |
|  Custo/Total    [Eye][Cp][Ed][Dl]|
+----------------------------------+
```

---

### Arquivos a modificar

| Arquivo | Alteracao |
|---------|----------|
| `src/components/ui/dialog.tsx` | Adicionar `pr-10` ao `DialogHeader` para reservar espaco do X |
| `src/components/orders/OrderDetails.tsx` | Reorganizar header: titulo em cima, botoes de acao abaixo |
| `src/components/orders/OrderCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/ingredients/IngredientCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/decorations/DecorationCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/packaging/PackagingCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/recipes/RecipeCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/products/ProductCard.tsx` | Mover botoes de acao para o rodape do card |
| `src/components/clients/ClientCard.tsx` | Mover botoes de acao para o rodape do card |

---

### Detalhes tecnicos

**Dialog close button fix (`dialog.tsx`):**
- O `DialogHeader` recebe `pr-10` por padrao para nunca sobrepor o X
- Isso e aplicado no componente base, corrigindo todos os dialogs de uma vez

**Cards - novo padrao de layout:**
- O header do card passa a ter apenas o titulo (e badge de categoria)
- Os botoes de acao migram para o rodape, ao lado do valor/custo
- Estrutura: `flex items-center justify-between` no footer com custo a esquerda e botoes a direita
- Isso elimina o truncamento forcado do nome e melhora a acessibilidade dos botoes em telas menores

**OrderDetails header fix:**
- Titulo "Detalhes do Pedido" fica na primeira linha com espaco para o X
- Botoes (Orcamento, Duplicar, Editar) ficam na linha abaixo como `flex flex-wrap gap-2`

