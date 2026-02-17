

## Corrigir Entrada de Estoque com Unidade Independente

### Problema

Quando um ingrediente e cadastrado em `kg` (ex: Acucar mascavo - 1 kg), os campos de estoque e alerta minimo tambem esperam valores em `kg`. Para registrar 100g de estoque, o usuario precisa digitar `0,1` -- pouco intuitivo. Enquanto isso, a lista de compras mostra necessidades em `g`, gerando confusao.

### Solucao

Adicionar um seletor de unidade independente ao lado dos campos de estoque e alerta minimo no formulario de ingredientes. O usuario escolhe em qual unidade quer informar (kg ou g, L ou ml, m ou cm), e o sistema converte automaticamente para a unidade principal antes de salvar no banco.

### Como funciona

```text
Exemplo: Ingrediente cadastrado em kg

Estoque atual: [ 100 ] [ g ]  --> salva como 0.1 kg no banco
Alerta minimo: [ 500 ] [ g ]  --> salva como 0.5 kg no banco

Exemplo: Ingrediente cadastrado em g

Estoque atual: [ 2 ] [ kg ]   --> salva como 2000 g no banco
Alerta minimo: [ 1 ] [ kg ]   --> salva como 1000 g no banco
```

O usuario digita no que for mais natural; o banco sempre recebe na unidade principal do ingrediente.

### Regras

- Para ingredientes em `un` (unidade), nao mostra seletor extra (nao faz sentido converter)
- As opcoes de unidade sao limitadas ao mesmo tipo (peso: kg/g, volume: L/ml, comprimento: m/cm)
- Ao editar um ingrediente existente, os campos mostram o valor ja convertido na unidade mais legivel (ex: 0.1 kg mostra como 100 g se for mais natural)
- Os alertas no `StockAlertsCard` e `IngredientCard` continuam funcionando corretamente pois o banco armazena tudo na mesma unidade principal

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ingredients/IngredientForm.tsx` | Adicionar estado `stockUnit` e `alertUnit` com seletores de unidade ao lado dos campos de estoque e alerta minimo. No `onSubmit`, converter para a unidade principal do ingrediente antes de salvar. No `useEffect` de edicao, detectar a melhor unidade para exibicao |
| `src/lib/unit-conversion.ts` | Adicionar funcao `getCompatibleUnits(unit)` que retorna as unidades do mesmo tipo (ex: `kg` retorna `['kg', 'g']`), e funcao `getBestDisplayUnit(value, unit)` que escolhe a unidade mais legivel para exibicao |

### O que NAO muda

- Banco de dados: nenhuma migracao necessaria (stock_quantity e min_stock_alert continuam em numeric)
- `StockAlertsCard.tsx`: comparacao `stock_quantity <= min_stock_alert` continua valida (ambos na mesma unidade)
- `IngredientCard.tsx`: exibicao continua usando a unidade principal do ingrediente
- `ShoppingList.tsx`: calculo de necessidades nao muda
- `StockDeductionDialog.tsx`: ja usa `convertUnit` para converter entre unidades

### Exemplo visual do formulario

```text
Campos opcionais:
  ┌─────────────────────────────────────┐
  │ Estoque Atual                       │
  │ ┌──────────────┐  ┌──────────────┐  │
  │ │     100      │  │    g    ▼    │  │
  │ └──────────────┘  └──────────────┘  │
  │                                     │
  │ Alerta de Estoque Minimo            │
  │ ┌──────────────┐  ┌──────────────┐  │
  │ │     500      │  │    g    ▼    │  │
  │ └──────────────┘  └──────────────┘  │
  └─────────────────────────────────────┘
```

### Impacto nos alertas

Nenhum impacto negativo. Como a conversao acontece antes de salvar, os valores no banco permanecem consistentes na unidade principal. As comparacoes em `StockAlertsCard` e `IngredientCard` continuam corretas sem alteracao.

