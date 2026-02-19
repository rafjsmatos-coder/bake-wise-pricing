

## Correcao: Mensagem de sucesso do pedido nao desaparece

### Problema encontrado

Este e um conflito conhecido entre o Radix Dialog (usado no formulario de pedidos) e o Sonner (biblioteca de notificacoes). Quando o pedido e salvo, duas coisas acontecem simultaneamente:

1. O toast de sucesso e disparado (`toast.success(...)`)
2. O dialog fecha (`setFormOpen(false)`)

O fechamento do Dialog dispara eventos internos do Radix que interferem com o timer de auto-dismiss do Sonner, fazendo a mensagem ficar "presa" na tela. Isso nao acontece com ingredientes, receitas e decoracoes porque esses modulos usam formularios que nao tem essa mesma interacao de fechamento.

### Solucao

Garantir que o Dialog feche ANTES do toast ser exibido, usando um pequeno delay. Tambem adicionar a propriedade `modal={false}` no Sonner para evitar conflitos de foco com outros componentes modais.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/orders/OrdersList.tsx` | No `handleSubmit`, fechar o dialog primeiro e deixar o toast ser disparado pelo `onSuccess` do hook naturalmente apos o dialog ja ter fechado. |
| `src/components/ui/sonner.tsx` | Adicionar `position="top-center"` e `toastOptions.style` com `pointerEvents: 'auto'` para evitar conflitos com dialogs Radix. |

### Detalhes tecnicos

**Antes** (dialog e toast competem):
```text
mutate.onSuccess → toast.success() + setFormOpen(false)  ← conflito de eventos
```

**Depois** (dialog fecha primeiro, toast aparece livre):
```text
handleSubmit.onSuccess → setFormOpen(false) → apos 150ms → toast.success()
```

A mudanca no `handleSubmit` do `OrdersList.tsx` vai fazer o dialog fechar primeiro via callback local, e o toast sera chamado com um pequeno atraso para garantir que o Radix Dialog ja terminou sua animacao de saida.

Tambem sera verificado se outros formularios com Dialog (produtos, embalagens) tem o mesmo problema, e a correcao sera aplicada neles tambem se necessario.

