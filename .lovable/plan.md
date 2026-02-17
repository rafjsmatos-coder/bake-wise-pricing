

## Exibicao Inteligente de Unidades e Conversao Correta em Todo o Sistema

### Problemas identificados

1. **Cards de ingredientes** mostram `0,100 kg` em vez de `100 g` (linha 80 do IngredientCard)
2. **Cards de decoracoes** mostram estoque na unidade principal sem conversao inteligente (linha 72 do DecorationCard)
3. **Cards de embalagens** mostram estoque na unidade principal sem conversao inteligente (linha 87 do PackagingCard)
4. **Dashboard (StockAlertsCard)** mostra estoque e alerta minimo na unidade principal sem conversao (linhas 181-183)
5. **Lista de Compras (ShoppingList)** nao converte estoque da unidade principal para a unidade da receita, resultando em "Estoque: 0,10 g" quando deveria ser "100 g" (bug ja identificado no plano anterior, ainda nao implementado)
6. **Formularios de decoracoes e embalagens** nao tem seletor de unidade independente para estoque/alerta (so ingredientes tem)
7. **Dialogo de deducao de estoque (StockDeductionDialog)** - ja funciona corretamente com `convertUnit`, nao precisa de alteracao

### Solucao

Usar a funcao `getBestDisplayUnit` (que ja existe em `unit-conversion.ts`) para exibir valores de estoque na unidade mais legivel em todos os cards e alertas. Adicionar conversao de unidades na lista de compras. Adicionar seletores de unidade nos formularios de decoracoes e embalagens.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ingredients/IngredientCard.tsx` | Importar `getBestDisplayUnit` e usar para exibir `stock_quantity` e `min_stock_alert` na unidade mais legivel |
| `src/components/decorations/DecorationCard.tsx` | Importar `getBestDisplayUnit` e `formatNumber` para exibir estoque inteligente |
| `src/components/packaging/PackagingCard.tsx` | Importar `getBestDisplayUnit` e `formatNumber` para exibir estoque inteligente |
| `src/components/dashboard/StockAlertsCard.tsx` | Importar `getBestDisplayUnit` e `formatNumber` para exibir estoque e alerta minimo na melhor unidade |
| `src/components/orders/ShoppingList.tsx` | Importar `convertUnit` e converter `stock_quantity` da unidade do ingrediente para a unidade da receita antes de calcular `toBuy` |
| `src/components/decorations/DecorationForm.tsx` | Adicionar estados `stockUnit`/`alertUnit` com seletores de unidade e conversao no submit (mesmo padrao do IngredientForm) |
| `src/components/packaging/PackagingForm.tsx` | Adicionar estados `stockUnit`/`alertUnit` com seletores de unidade e conversao no submit (mesmo padrao do IngredientForm) |

### Detalhes por arquivo

**IngredientCard.tsx** - Exibicao inteligente do estoque:
```text
Antes:  Estoque: 0,100 kg
Depois: Estoque: 100 g

Logica:
  const { displayValue, displayUnit } = getBestDisplayUnit(stock_quantity, ingredient.unit);
  // Exibir: formatNumber(displayValue) displayUnit
  // A comparacao isLowStock continua usando valores originais (ambos na mesma unidade principal)
```

**DecorationCard.tsx** e **PackagingCard.tsx** - Mesma logica do IngredientCard.

**StockAlertsCard.tsx** - Exibicao inteligente nos alertas do dashboard:
```text
Antes:  0.1 kg  / Min: 0.5 kg
Depois: 100 g   / Min: 500 g

Logica: usar getBestDisplayUnit para stockQuantity e minAlert, ambos com a mesma unidade do item
```
A comparacao `stock_quantity <= min_stock_alert` continua usando valores brutos do banco (sem conversao), mantendo a logica correta.

**ShoppingList.tsx** - Conversao de estoque para unidade da receita:
```text
Antes:
  stock = pi.ingredient.stock_quantity  (ex: 0.1, em kg)
  unit = pi.unit  (ex: g)
  Mostra: "Estoque: 0,10 g"  --> ERRADO

Depois:
  stock = convertUnit(0.1, 'kg', 'g') = 100
  Mostra: "Estoque: 100 g"   --> CORRETO
  toBuy = max(0, 16.29 - 100) = 0
```

Aplicar a conversao nos 4 blocos: ingredientes diretos, ingredientes de receitas, decoracoes e embalagens.

**DecorationForm.tsx** e **PackagingForm.tsx** - Adicionar seletores de unidade:
- Adicionar estados `stockUnit`, `alertUnit`, `stockDisplayValue`, `alertDisplayValue`
- Importar `getCompatibleUnits`, `getBestDisplayUnit`, `convertUnit`
- No `useEffect` de edicao: usar `getBestDisplayUnit` para preencher os valores na unidade mais legivel
- No `onSubmit`: converter de volta para a unidade principal usando `convertUnit` antes de salvar
- No template: adicionar `Select` ao lado dos campos de estoque e alerta (mesmo layout do IngredientForm)

### Dialogo de Deducao de Estoque

O `StockDeductionDialog.tsx` ja funciona corretamente:
- Armazena `stockUnit` separado do `unit` da receita (linha 24)
- Usa `getConvertedQty` com `convertUnit` para calcular a deducao na unidade correta (linha 190-193)
- Exibe a quantidade a descontar na unidade do estoque (linha 295-296)

Nenhuma alteracao necessaria.

### Impacto nos alertas

As comparacoes de alerta (`stock_quantity <= min_stock_alert`) continuam usando os valores brutos do banco, que estao todos na mesma unidade principal. A conversao e apenas visual (para exibicao). Portanto, os alertas funcionam corretamente sem nenhuma alteracao logica.

