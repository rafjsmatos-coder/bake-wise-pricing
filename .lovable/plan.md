

## Diagnóstico: Drawer dentro de Dialog -- conflito de portais e focus trap

### Causa raiz identificada

O `ProductForm` renderiza dentro de um **Dialog** (Radix). No mobile (`isMobile === true`), cada selector (RecipeSelector, IngredientSelector, DecorationSelector, PackagingSelector) abre um **Drawer** (vaul) para mostrar a lista de itens.

O problema: **Drawer abre como portal independente, fora da arvore DOM do Dialog**. O Radix Dialog e modal por padrao -- ele ativa um **focus trap** que impede interacao com elementos fora dele. Quando o Drawer abre seu portal, os `CommandItem` ficam fora do focus trap do Dialog, e o `onSelect` do cmdk nunca dispara no toque.

Isso explica por que:
- **A lista aparece** (o Drawer renderiza visualmente)
- **Tocar no item nao faz nada** (o focus trap do Dialog bloqueia o evento)
- **No navegador desktop funciona** (usa Popover ao inves de Drawer, e Popover do Radix e tratado diferente pelo focus trap)
- **No PWA standalone piora** (o modo standalone muda o comportamento de focus/touch do browser)

### Evidencia no codigo

Todos os 4 selectors seguem o mesmo padrao problematico:

```text
Dialog (modal=true, focus trap ativo)
  └── DialogContent (portal z-50)
        └── RecipeSelector / IngredientSelector / ...
              └── isMobile ? Drawer (portal separado z-50) : Popover
                              └── Command > CommandItem (onSelect bloqueado pelo focus trap)
```

- `src/components/ui/dialog.tsx`: Dialog usa `DialogPrimitive.Root` sem `modal={false}` -- padrao e modal
- `src/components/ui/drawer.tsx`: Drawer usa `DrawerPrimitive.Root` com `shouldScaleBackground` -- tambem modal
- Selectors: `RecipeSelector.tsx` L188, `IngredientSelector.tsx` L174, `DecorationSelector.tsx` L174, `PackagingSelector.tsx` L140

### Solucao proposta

**Substituir o Drawer por Popover em todos os 4 selectors quando estao dentro de um Dialog.** Como os selectors ja estao dentro de um Dialog fullscreen no mobile (`max-w-[100vw] max-h-[100dvh]`), nao precisa de um segundo modal. A abordagem mais simples e robusta:

**Usar Popover para todos os tamanhos de tela** (remover a condicional `isMobile ? Drawer : Popover`). O Popover do Radix funciona dentro do focus trap do Dialog porque e renderizado como parte da mesma arvore de acessibilidade.

### Arquivos a alterar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/products/selectors/RecipeSelector.tsx` | Remover import de Drawer, remover branch `isMobile`, usar so Popover |
| `src/components/products/selectors/IngredientSelector.tsx` | Idem |
| `src/components/products/selectors/DecorationSelector.tsx` | Idem |
| `src/components/products/selectors/PackagingSelector.tsx` | Idem |

Em cada selector, a mudanca e:
1. Remover imports de `Drawer`, `DrawerContent`, `DrawerTrigger`
2. Remover import de `useIsMobile`
3. Remover a condicional `isMobile ? <Drawer>...</Drawer> : <Popover>...</Popover>`
4. Manter apenas o bloco `<Popover>` com `PopoverContent` configurado para funcionar bem em mobile (largura responsiva)
5. Converter `CommandContent` de variavel JSX para componente funcional (`const CommandContent = () => (...)`) para garantir reconciliacao correta

### Detalhes tecnicos do PopoverContent mobile

O PopoverContent precisa de ajustes para funcionar bem em tela pequena:
- `className="w-[--radix-popover-trigger-width] p-0"` para alinhar com o botao trigger
- Ou `className="w-[calc(100vw-2rem)] sm:w-[300px] p-0"` para largura responsiva

