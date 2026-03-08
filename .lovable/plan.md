

# Realçar o Botão "Campos Opcionais"

## Problema
O botão `variant="ghost"` com `text-muted-foreground` é muito discreto e passa despercebido. Ele aparece em **4 formulários**: RecipeForm, IngredientForm, DecorationForm e PackagingForm.

## Solução
Padronizar todos os 4 botões com um estilo levemente mais visível, sem exagerar:

- Trocar `variant="ghost"` por `variant="outline"` — adiciona uma borda sutil que destaca o botão sem ser agressivo
- Usar `text-muted-foreground` para manter o tom secundário
- Padronizar o layout: ícone `ChevronDown`/`ChevronUp` à direita + texto "Campos opcionais" à esquerda + ícone `Settings2` em todos
- Adicionar `border-dashed` para diferenciar visualmente de botões de ação primária (borda tracejada = "há mais aqui")

Resultado visual: um botão com borda tracejada sutil, ícone de engrenagem e chevron, que comunica claramente "expanda para ver mais" sem competir com os botões principais.

## Arquivos a modificar (4)
1. **`src/components/recipes/RecipeForm.tsx`** — já tem `Settings2`, padronizar estilo
2. **`src/components/ingredients/IngredientForm.tsx`** — adicionar `Settings2`, trocar variant
3. **`src/components/decorations/DecorationForm.tsx`** — adicionar `Settings2`, trocar variant
4. **`src/components/packaging/PackagingForm.tsx`** — adicionar `Settings2`, trocar variant

Padrão unificado para todos:
```tsx
<Button
  type="button"
  variant="outline"
  className="w-full justify-between min-h-[44px] border-dashed text-muted-foreground"
  onClick={() => setShowOptional(!showOptional)}
>
  <span className="flex items-center gap-2">
    <Settings2 className="h-4 w-4" />
    Campos opcionais
  </span>
  {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
</Button>
```

