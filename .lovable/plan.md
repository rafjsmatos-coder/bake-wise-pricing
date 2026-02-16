
## Corrigir Atualização de Cache Após Baixa de Estoque

### Problema

Quando a baixa de estoque é confirmada, o sistema atualiza corretamente os valores no banco de dados, mas **não invalida os caches** dos ingredientes, decorações e embalagens na interface. O callback `onComplete` do diálogo de dedução só invalida o cache de `orders`, mas não os caches dos materiais que foram modificados.

Por isso, a tela continua mostrando os valores antigos até você sair e entrar novamente (o que força o recarregamento completo dos dados).

### Solução

Adicionar invalidação dos caches de `ingredients`, `decorations` e `packaging` em dois pontos:

**1. No `StockDeductionDialog` (após confirmar a baixa)**

Adicionar `useQueryClient` e invalidar diretamente os caches dos materiais após a atualização no banco:

- `ingredients` 
- `decorations`
- `packaging`
- `products` (pois exibem dados de estoque dos materiais vinculados)

**2. No `OrdersList` (callback `onComplete`)**

Expandir o callback para também invalidar os mesmos caches, garantindo cobertura dupla.

### Arquivos a editar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/orders/StockDeductionDialog.tsx` | Importar `useQueryClient`, invalidar caches de `ingredients`, `decorations`, `packaging` e `products` no `handleConfirm` |
| `src/components/orders/OrdersList.tsx` | Adicionar invalidação de `ingredients`, `decorations`, `packaging` no callback `onComplete` |

### Detalhes técnicos

No `StockDeductionDialog.tsx`, dentro do `handleConfirm`, após o loop de updates:

```typescript
const queryClient = useQueryClient();
// ... após os updates ...
queryClient.invalidateQueries({ queryKey: ['ingredients'] });
queryClient.invalidateQueries({ queryKey: ['decorations'] });
queryClient.invalidateQueries({ queryKey: ['packaging'] });
queryClient.invalidateQueries({ queryKey: ['products'] });
```

No `OrdersList.tsx`, expandir o `onComplete`:

```typescript
onComplete={() => {
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['ingredients'] });
  queryClient.invalidateQueries({ queryKey: ['decorations'] });
  queryClient.invalidateQueries({ queryKey: ['packaging'] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
}}
```

### Resultado

Após a baixa de estoque, todos os dados atualizados serão refletidos imediatamente na interface sem precisar recarregar a página ou fazer logout/login.
