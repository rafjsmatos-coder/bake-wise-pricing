

## Corrigir Botao "Sair" Cortado no Menu "Mais" (Mobile)

### Problema

O botao "Sair" fica no final do menu "Mais" (Sheet inferior), mas em celulares com barra de navegacao/gestos, os elementos do sistema (bateria, hora, barra de gestos) cobrem a parte inferior, tornando o botao invisivel ou inacessivel.

### Causa

O `SheetContent` tem `pb-[env(safe-area-inset-bottom)]`, mas a area de scroll interna (`div.overflow-y-auto`) tem apenas `pb-4`, que nao e suficiente para garantir que o botao fique visivel acima dos controles do sistema.

### Solucao

1. **Mover o botao "Sair" para fora da area de scroll**, fixando-o na parte inferior do Sheet, sempre visivel
2. **Adicionar padding seguro** abaixo do botao para respeitar a safe area do dispositivo

### Layout corrigido

```text
┌─────────────────────────────┐
│ Menu (titulo)               │
├─────────────────────────────┤
│ [Avatar] Nome do usuario    │  ← area de scroll
│ ─────────────────────────── │
│ Materiais                   │
│   Ingredientes              │
│   Receitas                  │
│   Decoracoes                │
│   Embalagens                │
│ Gestao                      │
│   Clientes                  │
│   Lista de Compras          │
│ Sistema                     │
│   Configuracoes             │
│   Novidades                 │
│   Suporte                   │
├─────────────────────────────┤
│ [Sair]                      │  ← fixo, fora do scroll
│ (safe area padding)         │
└─────────────────────────────┘
```

### Alteracao

| Arquivo | O que muda |
|---------|-----------|
| `src/components/layout/MoreMenu.tsx` | Separar o botao "Sair" da `div` de scroll, colocando-o em uma `div` fixa com `border-t` e padding que inclui `safe-area-inset-bottom`. Isso garante que o botao esteja sempre visivel, independente do tamanho da tela ou da barra de sistema do celular |

