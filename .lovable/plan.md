

# Correcao: Salvamento de Configuracoes + Scroll do Formulario de Ingredientes

## Problema 1: Configuracoes falham na primeira tentativa

O hook `useUserSettings` nao usa o helper `ensureSessionUserId` nem `retry: 1`, diferente de todos os outros hooks do sistema (ingredientes, receitas, produtos, pedidos). Isso causa a mesma condicao de corrida na autenticacao: na primeira tentativa, a sessao pode nao estar totalmente ativa, e a mutacao falha por RLS. Na segunda tentativa, a sessao ja esta pronta e funciona.

### Correcao

No `src/hooks/useUserSettings.tsx`:
- Importar `ensureSessionUserId` de `@/lib/ensure-session`
- Usar `ensureSessionUserId()` no inicio do `mutationFn` do `updateSettings` em vez de checar `user` manualmente
- Adicionar `retry: 1` na mutacao

---

## Problema 2: Scroll horizontal no formulario de ingredientes (mobile)

O `DialogContent` do `IngredientForm` nao tem as propriedades CSS de estabilidade mobile que ja sao padrao em outros dialogos do sistema. Ao expandir os campos opcionais e arrastar o scroll, a pagina se desloca horizontalmente.

### Correcao

No `src/components/ingredients/IngredientForm.tsx`, adicionar estilos inline no `DialogContent`:
- `overscrollBehavior: 'contain'` -- impede propagacao do scroll
- `touchAction: 'pan-y'` -- restringe toque a scroll vertical apenas

O `overflow-x: hidden` sera adicionado via classe CSS (ja existe `overflow-y-auto`, basta complementar).

---

## Arquivos alterados

| Arquivo | Acao |
|---|---|
| `src/hooks/useUserSettings.tsx` | Adicionar `ensureSessionUserId` + `retry: 1` |
| `src/components/ingredients/IngredientForm.tsx` | Adicionar estilos de estabilidade mobile no DialogContent |

