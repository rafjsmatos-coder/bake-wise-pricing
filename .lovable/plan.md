

# Plano Revisado: Soft Delete + Snapshots — Status de Implementação

## ✅ Concluído

### Migração de Banco
- `is_active BOOLEAN NOT NULL DEFAULT true` em: ingredients, recipes, products, packaging, decorations, clients
- `product_name TEXT NOT NULL`, `cost_at_sale NUMERIC`, `profit_at_sale NUMERIC` em order_items
- `client_name TEXT NOT NULL` em orders
- FKs `order_items.product_id` e `orders.client_id` alteradas de CASCADE para SET NULL (nullable)
- Backfill de product_name e client_name para dados existentes
- Índices parciais para is_active
- Backfill de `cost_per_unit` em decorations

### Hooks atualizados
- Todos os hooks (useIngredients, useRecipes, useProducts, usePackaging, useDecorations, useClients) filtram `is_active = true`
- Todos têm mutation `deactivate[Entity]` para soft delete
- useDecorations agora calcula `cost_per_unit` no create/update/duplicate
- useOrders salva `product_name`, `client_name`, `cost_at_sale`, `profit_at_sale`
- Snapshot de custo congelado quando status != 'quote' (ao sair de orçamento)

### Bugs corrigidos
- **CRÍTICO**: `ri.ingredient` → `ri.ingredients` em ProductsList.tsx (custo de receitas era zero no produto)
- **CRÍTICO**: Decorações com `cost_per_unit = NULL` — corrigido no hook + fallback no calculator
- Fallback no `product-cost-calculator.ts` para calcular cost_per_unit on-the-fly

### Componentes criados/integrados
- `DeleteOrDeactivateDialog` — verifica dependências e oferece desativar vs excluir
- `useDependencyCheck` — verifica dependências em tabelas de vínculo
- Integrado em TODAS as listas: IngredientsList, ProductsList, RecipesList, ClientsList, PackagingList, DecorationsList
- IngredientsList com aviso de histórico de preços no hard delete

## 🔲 Pendente (próxima iteração)

- Toggle "Mostrar inativos" nas listas
- Visual diferenciado para itens inativos
- Ajustar relatórios financeiros para usar cost_at_sale quando disponível
- Remover botão "Excluir" de pedidos (usar apenas Cancelar)
- Ajustar exibição de order_items/orders para usar snapshots quando FK for NULL
