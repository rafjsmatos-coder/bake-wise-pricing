

# Padronizacao de Cards, Formularios e Valores nos Seletores

## Problemas Identificados

### 1. Botao "Duplicar" inconsistente entre Receitas e Produtos
- **Produtos**: o card ja mostra os 4 botoes (Ver, Duplicar, Editar, Excluir) + a visualizacao tambem tem botoes de acao
- **Receitas**: o card so mostra 3 botoes (Ver, Editar, Excluir) -- o "Duplicar" so aparece dentro da visualizacao (RecipeDetails)

### 2. Visualizacao de Produtos (ProductDetails) sem botoes de acao
- O dialog de detalhes do produto nao tem botoes de "Editar" e "Duplicar" no header, diferente da visualizacao de receitas (RecipeDetails) que tem

### 3. Campos pre-preenchidos com zero
- Alguns formularios usam `valueAsNumber: true` com `register()` que converte campos vazios para `0` ao inves de manter vazio
- Formularios que usam `z.coerce.number()` com o componente `Form` (shadcn) tratam `field.value ?? ''` corretamente, mas os que usam `register` direto nao
- Campos afetados: `stock_quantity`, `min_stock_alert` nos formularios de ingredientes e decoracoes (usando `register('field', { valueAsNumber: true })`)

### 4. Seletores do produto nao mostram valores/custos
- **Receitas (IngredientSelector)**: mostra custo por unidade na lista, preview de custo ao digitar quantidade, e total ao final -- funciona bem
- **Produtos (RecipeSelector)**: mostra apenas "Rende: X un" mas nao mostra o custo total da receita
- **Produtos (IngredientSelector)**: nao mostra custo por unidade nem custo estimado
- **Produtos (DecorationSelector)**: nao mostra custo por unidade nem custo estimado
- **Produtos (PackagingSelector)**: nao mostra custo por unidade nem custo estimado

---

## Solucao Proposta

### Parte 1: Padronizar botoes no card de Receita

Adicionar o botao "Duplicar" (icone Copy) ao `RecipeCard.tsx`, entre os botoes "Ver" e "Editar", igual ao padrao do `ProductCard.tsx`.

Arquivos: `src/components/recipes/RecipeCard.tsx`

### Parte 2: Adicionar botoes de acao na visualizacao de Produtos

Adicionar botoes "Duplicar" e "Editar" no header do `ProductDetails.tsx`, igual ao padrao do `RecipeDetails.tsx`. Isso requer passar as callbacks `onEdit` e `onDuplicate` como props.

Arquivos: `src/components/products/ProductDetails.tsx`, `src/components/products/ProductsList.tsx`

### Parte 3: Corrigir campos pre-preenchidos com zero

Nos formularios de ingredientes e decoracoes, os campos `stock_quantity` e `min_stock_alert` usam `register('field', { valueAsNumber: true })` que converte string vazia para `NaN` mas com o `placeholder="0"` pode confundir. O problema real esta no `setValueAs` -- preciso garantir que campos opcionais numericos usem o pattern `setValueAs: (v) => v === '' ? null : Number(v)` ao inves de `valueAsNumber: true` para campos que devem aceitar nulo.

Tambem corrigir o placeholder de "0" para algo mais descritivo como "Opcional" nos campos de estoque.

Arquivos: `src/components/ingredients/IngredientForm.tsx`, `src/components/decorations/DecorationForm.tsx`

### Parte 4: Mostrar valores nos seletores do formulario de Produto

Enriquecer os 4 seletores do formulario de produto com informacoes de custo:

**RecipeSelector**: Ao listar receitas disponiveis, mostrar o custo total da receita. Na lista de receitas selecionadas, mostrar o custo proporcional baseado na quantidade usada.

**IngredientSelector (produtos)**: Ao listar ingredientes, mostrar custo por unidade. Na lista de selecionados, mostrar custo calculado da quantidade. Ao final, mostrar total.

**DecorationSelector**: Mesmo padrao -- mostrar custo unitario na lista e custo total da quantidade selecionada.

**PackagingSelector**: Mostrar custo unitario na lista e custo total da quantidade selecionada.

Arquivos:
- `src/components/products/selectors/RecipeSelector.tsx`
- `src/components/products/selectors/IngredientSelector.tsx`
- `src/components/products/selectors/DecorationSelector.tsx`
- `src/components/products/selectors/PackagingSelector.tsx`

---

## Detalhes Tecnicos

### RecipeCard - Adicionar botao Duplicar

Importar o icone `Copy` e adicionar um botao entre `Eye` e `Pencil`:
```tsx
<Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8" title="Duplicar">
  <Copy className="h-4 w-4" />
</Button>
```

### ProductDetails - Adicionar botoes de acao

Adicionar props `onEdit` e `onDuplicate` ao componente e renderizar botoes no header, similar ao RecipeDetails:
```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm" onClick={onDuplicate}>
    <Copy className="h-4 w-4 mr-1" /> Duplicar
  </Button>
  <Button size="sm" onClick={onEdit}>
    <Edit className="h-4 w-4 mr-1" /> Editar
  </Button>
</div>
```

### Campos numericos opcionais

Substituir `register('stock_quantity', { valueAsNumber: true })` por:
```tsx
register('stock_quantity', { 
  setValueAs: (v) => v === '' || v === null || v === undefined ? null : Number(v)
})
```

### Seletores com custos

Para o **RecipeSelector**, receber `recipeCosts` como prop e calcular o custo proporcional:
```tsx
// Na lista de receitas disponiveis:
<span className="text-xs text-muted-foreground">
  Custo: R$ {formatCurrency(recipeCosts[recipe.id])}
</span>

// Na lista de selecionadas:
const recipeTotalCost = recipeCosts[item.recipe_id] || 0;
const proportion = item.quantity / item.yield_quantity;
const costForQuantity = recipeTotalCost * proportion;
```

Para **IngredientSelector**, **DecorationSelector** e **PackagingSelector**, calcular custo com base no `cost_per_unit`:
```tsx
const cost = ingredient.cost_per_unit * convertedQuantity;
```

---

## Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `RecipeCard.tsx` | Adicionar botao Duplicar + title nos botoes |
| `ProductDetails.tsx` | Adicionar botoes Editar/Duplicar no header |
| `ProductsList.tsx` | Passar callbacks onEdit/onDuplicate para ProductDetails |
| `IngredientForm.tsx` | Corrigir setValueAs nos campos stock_quantity/min_stock_alert |
| `DecorationForm.tsx` | Corrigir setValueAs nos campos stock_quantity/min_stock_alert |
| `RecipeSelector.tsx` | Mostrar custo das receitas na lista e custo proporcional |
| `IngredientSelector.tsx` (produtos) | Mostrar custo unitario e custo por item selecionado |
| `DecorationSelector.tsx` | Mostrar custo unitario e custo por item selecionado |
| `PackagingSelector.tsx` | Mostrar custo unitario e custo por item selecionado |

