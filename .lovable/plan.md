

## Corrigir Tour Mobile + Dica do Carrossel

---

### Problema 1: Tour mobile nao ativa

O `ReactTourProvider` recebe os steps como prop, mas o hook `useIsMobile()` começa retornando `false` (porque o estado inicial eh `undefined`). Quando atualiza para `true`, o provider pode nao reagir a mudanca de steps.

**Solucao:** Adicionar `key={isMobile ? 'mobile' : 'desktop'}` no `ReactTourProvider` para forcar a recriacao do componente quando o modo muda. Isso garante que os steps corretos sejam usados.

### Problema 2: Usuario nao sabe que pode deslizar os cards

O passo "Visao Geral" atual diz apenas "Clique em qualquer card para acessar a lista completa", mas nao menciona que ha mais cards alem dos visiveis e que o usuario pode deslizar para ver todos.

**Solucao:** Atualizar o texto do passo 1 (summary-cards) para mencionar o gesto de arrastar/deslizar:

- **Mobile:** "Deslize para o lado para ver todos os cards. Toque em qualquer um para acessar a lista completa."
- **Desktop:** Manter o texto atual (todos os cards sao visiveis no desktop).

---

### Arquivo a modificar

| Arquivo | Alteracao |
|---------|----------|
| `src/components/tour/TourProvider.tsx` | Adicionar `key` no `ReactTourProvider` para forcar remount. Atualizar texto do passo summary-cards no mobile para mencionar o carrossel. |

### Detalhe tecnico

```text
// No ReactTourProvider, adicionar:
key={isMobile ? 'mobile' : 'desktop'}

// No passo mobile summary-cards, atualizar texto para:
"Deslize para o lado para ver todos os cards de resumo.
Toque em qualquer um para acessar a lista completa."
```

