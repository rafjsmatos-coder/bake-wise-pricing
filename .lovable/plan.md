

# Tornar o Painel Admin Responsivo

## Problemas Identificados

O painel admin usa tabelas HTML (`<Table>`) com múltiplas colunas que não se adaptam a telas pequenas. Os filtros também usam layouts fixos que quebram em mobile. Principais problemas:

1. **AdminLayout**: O sidebar funciona com toggle mobile, mas o conteúdo principal não tem padding adequado para mobile
2. **Tabelas**: UserManagement (7+ colunas), SupportManagement (6 colunas), AuditLogsManagement (5 colunas) — todas transbordam horizontalmente
3. **Filtros**: Campos de data e selects com largura fixa (`w-[150px]`, `w-[180px]`) não se adaptam
4. **Cards de estatísticas**: Grid `grid-cols-2 lg:grid-cols-4` funciona, mas textos e valores podem ser cortados
5. **Gráficos**: FunnelChart com `LabelList position="right"` corta labels em telas pequenas

## Plano de Implementação

### 1. Tabelas com scroll horizontal + cards mobile
Para cada tabela (UserManagement, SupportManagement, AuditLogsManagement):
- Envolver em `<div className="overflow-x-auto -mx-4 px-4">` para scroll horizontal em mobile
- Adicionar `min-w-[600px]` nas tabelas para evitar compressão excessiva
- Esconder colunas menos importantes em mobile com `hidden sm:table-cell`

### 2. Filtros responsivos
- AuditLogsManagement: Empilhar filtros em coluna única em mobile (`flex-col` ao invés de `sm:flex-row` para os inputs de data)
- SupportManagement: Selects já usam `flex-col sm:flex-row`, ajustar larguras para `w-full sm:w-[140px]`

### 3. AdminStats responsivo
- Reduzir `text-2xl` para `text-xl` em mobile nos cards
- FunnelChart: Usar `LabelList position="center"` em vez de `"right"` ou esconder labels externos
- Retenção: `grid-cols-1 sm:grid-cols-2`

### 4. Paginação responsiva
- Empilhar texto e botões em mobile (`flex-col sm:flex-row`)

### Arquivos a modificar
- `src/components/admin/AdminStats.tsx` — grids e gráficos responsivos
- `src/components/admin/UserManagement.tsx` — tabela com scroll, colunas ocultas em mobile
- `src/components/admin/SupportManagement.tsx` — tabela e filtros responsivos
- `src/components/admin/AuditLogsManagement.tsx` — tabela, filtros e paginação responsivos
- `src/components/layout/AdminLayout.tsx` — ajustes menores de padding

