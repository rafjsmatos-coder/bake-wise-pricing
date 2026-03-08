

## Plano: Melhorias do projeto + Pull-to-refresh + Botão reload

### 1. Corrigir conflito skipWaiting no `vite.config.ts`
Remover `skipWaiting: true` e `clientsClaim: true` do bloco workbox. Esses valores conflitam com `registerType: "prompt"` — fazem o SW ativar sozinho antes do usuário clicar "Atualizar".

### 2. Corrigir signOut frágil no `AppLayout.tsx`
Remover o `setTimeout` + `localStorage.removeItem` manual (linhas 134-137). Confiar no `signOut()` do hook que já limpa a sessão. Usar `window.location.replace('/')` apenas no catch como fallback.

### 3. Sincronizar tab do FinancialPage
Adicionar `useEffect` para atualizar `activeTab` quando `initialTab` mudar (navegação lateral).

### 4. Pull-to-refresh (mobile) + botão reload (header)

**Pull-to-refresh**: Implementar um gesto de arrastar para baixo no `<main>` do `AppLayout` que executa `window.location.reload()`. Usar touch events nativos (`touchstart`, `touchmove`, `touchend`) com um indicador visual (ícone de refresh + spinner). Ativa apenas quando o scroll está no topo.

**Botão reload no header mobile**: Adicionar um ícone `RefreshCw` ao lado do avatar no header mobile que faz `window.location.reload()`.

### Arquivos a alterar

| Arquivo | Mudança |
|---------|---------|
| `vite.config.ts` | Remover `skipWaiting` e `clientsClaim` |
| `src/components/layout/AppLayout.tsx` | Limpar signOut, adicionar botão reload no header, implementar pull-to-refresh |
| `src/components/financial/FinancialPage.tsx` | Adicionar useEffect para sincronizar tab |

