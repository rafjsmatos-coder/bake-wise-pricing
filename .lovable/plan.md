
## Corrigir campos de estoque salvando 0 em vez de nulo

### Problema
Quando o usuario limpa os campos "Estoque Atual" e "Alerta de Estoque Minimo" nos formularios de Embalagens, Ingredientes e Decoracoes, o valor salvo no banco e `0` em vez de `null`. Isso causa:
- Cards com "Estoque: 0" aparecendo em vermelho nos listagens
- Alertas falsos no Dashboard (apesar do fix anterior com `> 0`)

### Causa raiz
- **PackagingForm**: Usa `z.coerce.number().optional()` que converte string vazia para `0`
- **IngredientForm e DecorationForm**: O `setValueAs` funciona na entrada, mas o `onSubmit` nao trata `0` como `null` para campos opcionais

### Solucao

Corrigir o tratamento no momento do submit em todos os tres formularios, garantindo que valores `0` ou `undefined` nos campos de estoque sejam salvos como `null`.

### Detalhes tecnicos

**1. PackagingForm.tsx**
- Alterar o schema zod de `z.coerce.number().optional()` para `z.number().optional().nullable()` nos campos `stock_quantity` e `min_stock_alert`
- Atualizar o `onChange` dos `FormField` para converter string vazia em `null`
- No `onSubmit`, tratar: `stock_quantity: data.stock_quantity || null` (onde `0`, `undefined` e `null` viram `null`)

**2. IngredientForm.tsx**
- No `onSubmit`, alterar de `data.stock_quantity ?? null` para `data.stock_quantity || null`
- Mesma alteracao para `min_stock_alert`

**3. DecorationForm.tsx**
- No `onSubmit`, alterar de `data.stock_quantity ?? null` para `data.stock_quantity || null`
- Mesma alteracao para `min_stock_alert`

A diferenca e que `??` so converte `null/undefined` para `null`, enquanto `||` tambem converte `0` para `null` -- que e exatamente o comportamento desejado para campos opcionais de estoque.
