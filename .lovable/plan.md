

# Auditoria de UX -- Problemas Encontrados

Depois de analisar detalhadamente os componentes de layout, navegação, cards, formulários, dashboard, busca, financeiro e admin, a UX está bastante sólida no geral. Os padrões mobile-first, safe areas, touch targets e responsividade estão bem implementados.

Encontrei **3 problemas pontuais** que merecem ajuste:

---

## 1. Desktop: Sidebar sem título de página visível
No mobile, o header exibe o título da página atual (ex: "Ingredientes", "Pedidos"). No desktop, **não existe nenhum heading** no topo do conteúdo -- o usuário vai direto ao conteúdo sem contexto visual de onde está.

**Solução**: Adicionar um header discreto no topo da área de conteúdo desktop (hidden em mobile, pois já tem no header fixo). Uma `<h1>` com o `PAGE_TITLES[currentPage]` e classe `hidden lg:block text-2xl font-bold mb-6`.

---

## 2. Admin Layout: Sidebar mobile não fecha ao clicar fora em telas intermediárias
O overlay (`bg-background/80`) existe, mas a sidebar usa `translate-x` sem `lg:hidden` no overlay div, o que pode causar flicker em tablets. Além disso, o header admin usa `h-16` enquanto o app principal usa `h-14` -- inconsistência visual se o usuário transiciona entre os dois.

**Solução**: Padronizar o header admin mobile para `h-14` (alinhado com o AppLayout) e garantir o `pt-14` correspondente no main content.

---

## 3. Dashboard: Cards de resumo sem indicação de scroll horizontal no mobile
Os summary cards usam `overflow-x-auto` mas não há nenhuma indicação visual de que existem mais cards à direita. Em telas pequenas, os cards de "Decorações", "Embalagens" e "Clientes" ficam completamente ocultos.

**Solução**: Adicionar um gradiente de fade sutil na borda direita do container de scroll (pseudo-element `after:` com gradiente `from-transparent to-background`) para sugerir que há mais conteúdo.

---

## Resumo de Mudanças

| Arquivo | Mudança |
|---|---|
| `src/components/layout/AppLayout.tsx` | Adicionar heading desktop com título da página |
| `src/components/layout/AdminLayout.tsx` | Padronizar `h-14` no header mobile + `pt-14` no main |
| `src/components/dashboard/DashboardHome.tsx` | Adicionar gradiente de fade no scroll horizontal dos summary cards |

Todas as mudanças são pequenas e pontuais, sem risco de quebrar funcionalidade existente.

