
## Objetivo
Corrigir definitivamente (1) o erro recorrente de verificação de assinatura (“Session expired” / 401 / “Auth session missing!”) no domínio **precibake.com.br** e (2) o problema do botão **“Assinar Premium”** que “não faz nada” no celular (no Dashboard e na página de Assinatura), além de revisar os demais botões relacionados (upgrade e portal do cliente).

---

## Diagnóstico (com base no print e nos logs)
### 1) Erro de verificação de assinatura / admin (401)
Os logs das funções mostram repetidamente:
- **`Authentication failed - {"error":"Auth session missing!"}`** (check-subscription)
- **`Authentication error: Auth session missing!`** (check-admin-role)

Isso indica que a validação de usuário dentro das funções está falhando no trecho que usa `supabaseAdmin.auth.getUser(token)` / `supabaseClient.auth.getUser(token)` (mesmo quando o header Authorization “existe”). Esse tipo de erro é comum em ambiente Deno/Edge com certas combinações do SDK, e pode acontecer mesmo com token “aparentemente correto”.

Resultado prático: a verificação de assinatura cai em “expirado” e o sistema bloqueia o acesso mesmo para quem pagou.

### 2) Botão “Assinar Premium” não funciona no celular
Nos componentes, o fluxo é:
- `onClick` → `await createCheckout()` → `window.open(url, '_blank')`

Em navegadores mobile (principalmente iOS Safari e alguns Android), **popups são bloqueados quando o `window.open()` acontece depois de um `await`** (perde o “gesto do usuário”). Por isso “não acontece nada”.

Também há o mesmo risco em “Gerenciar Assinatura” (customer portal), porque hoje o hook abre `window.open` somente depois de esperar a função retornar.

---

## Estratégia de correção (2 frentes em paralelo)

### Frente A — “Resolver de vez” o erro de sessão/assinatura
1) **Trocar o método de autenticação dentro das funções do backend**
   - Implementar um helper compartilhado (ex.: `supabase/functions/_shared/auth.ts`) para:
     - Ler `Authorization: Bearer <token>`
     - Validar o token de forma robusta (sem depender de `auth.getUser(token)` do SDK que está retornando `Auth session missing!`)
     - Extrair `userId` (e `email` quando necessário)
   - Abordagem recomendada para ser bem estável:
     - Fazer uma chamada HTTP direta ao endpoint de usuário da autenticação (server-to-server), usando `fetch(...)` + `apikey` do backend, ou usar `getClaims()` (dependendo do que for mais confiável no runtime atual).
   - Adicionar logs seguros (ex.: `hasAuthHeader`, `tokenLength`) sem imprimir token.

2) **Aplicar o helper nas funções que hoje quebram**
   Atualizar para usar o helper e parar de usar `auth.getUser(token)`:
   - `supabase/functions/check-subscription/index.ts`
   - `supabase/functions/check-admin-role/index.ts`
   - `supabase/functions/create-checkout/index.ts`
   - `supabase/functions/customer-portal/index.ts`
   - `supabase/functions/admin-users/index.ts` (para não quebrar o painel admin também)

3) **Padronizar respostas de “não autenticado”**
   - Preferência para respostas previsíveis:
     - Retornar JSON com `{ error: "...", code: "unauthenticated" }`
     - Evitar 401 quando isso estiver causando “barulho”/tratamento ruim no client; ou manter 401 mas tratar no front (decisão no momento da implementação, priorizando UX e ausência de erros).
   - Importante: o `check-subscription` deve retornar um payload claro que o frontend consiga interpretar para forçar re-login quando necessário.

4) **No frontend: tratamento de sessão inválida**
   Em `src/hooks/useSubscription.tsx` e `src/hooks/useAdminRole.tsx`:
   - Criar uma função interna tipo `getFreshAccessToken()` que:
     - Tenta `supabase.auth.getSession()`
     - Se não houver token válido, tenta `supabase.auth.refreshSession()`
     - Se ainda falhar, faz `signOut()` e exibe mensagem amigável (“Sua sessão expirou, entre novamente.”)
   - Isso evita o estado “usuário logado mas tudo dá 401”.

5) **Melhorar UX no paywall para destravar o usuário**
   - Em `SubscriptionPaywall`, incluir botão “Sair / Entrar novamente” caso a sessão esteja inválida, para o usuário conseguir se recuperar sem ficar preso.

---

### Frente B — Revisar e corrigir todos os botões de assinatura (mobile/desktop)
1) **Criar um helper de navegação “safe” para abrir checkout/portal**
   Ex.: `src/lib/open-external.ts` com algo como:
   - Se for mobile: navegar no **mesmo tab** (`window.location.assign(url)`)
   - Se for desktop: abrir nova aba, mas **abrindo uma aba vazia antes do await**:
     - `const w = window.open('', '_blank')` (sincrono no clique)
     - depois do await: `w.location.href = url`
     - se falhar: `w.close()`

2) **Aplicar esse helper em todos os lugares que hoje fazem `window.open` após await**
   Atualizar handlers `handleUpgrade` para usar o helper:
   - `src/components/subscription/SubscriptionPaywall.tsx`
   - `src/components/subscription/SubscriptionBanner.tsx`
   - `src/components/subscription/SubscriptionSettings.tsx`
   - `src/components/dashboard/DashboardHome.tsx`

3) **Ajustar também “Gerenciar” (Customer Portal)**
   - Hoje `openCustomerPortal()` abre `window.open` dentro do hook depois do await → pode ser bloqueado no celular.
   - Mudança proposta:
     - `openCustomerPortal()` passa a **retornar a URL** (como `createCheckout`) e o componente usa o helper para navegar; ou
     - `openCustomerPortal()` já faz o “pre-open” da aba antes de chamar a função.

4) **Adicionar feedback visual e mensagens**
   - Em cada botão de upgrade/gerenciar:
     - Estado `isProcessing` para desabilitar botão + mostrar spinner
     - Toast/alerta quando:
       - `createCheckout()` retornar null
       - função responder “already_subscribed”
       - sessão expirar e for necessário re-login

---

## Checklist de testes (após implementar)
1) **No desktop**
   - Logar
   - Verificar que não aparecem erros 401 repetidos no console
   - Clicar “Assinar Premium” em:
     - Banner
     - Dashboard
     - Página de assinatura (Settings)
     - Paywall
   - Confirmar que o checkout abre corretamente
   - Voltar com `?checkout=success` e validar que o status muda para ativo

2) **No celular (ou em modo responsivo do navegador)**
   - Repetir os mesmos cliques
   - Confirmar que agora o checkout abre (sem popup bloqueado)
   - Testar “Gerenciar Assinatura” (portal do cliente)

3) **Robustez**
   - Forçar cenário de sessão inválida (ex.: logout/login, recarregar página) e confirmar que:
     - O app não fica preso em erro silencioso
     - Existe caminho claro para “Entrar novamente”

---

## Arquivos que serão alterados (resumo)
### Backend (funções)
- `supabase/functions/_shared/auth.ts` (novo helper)
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/check-admin-role/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/customer-portal/index.ts`
- `supabase/functions/admin-users/index.ts`

### Frontend
- `src/hooks/useSubscription.tsx`
- `src/hooks/useAdminRole.tsx`
- `src/components/subscription/SubscriptionPaywall.tsx`
- `src/components/subscription/SubscriptionBanner.tsx`
- `src/components/subscription/SubscriptionSettings.tsx`
- `src/components/dashboard/DashboardHome.tsx`
- `src/lib/...` (helper novo para navegação segura)

---

## Resultado esperado
- “Session expired / Auth session missing” deixa de acontecer como erro recorrente e, quando a sessão realmente expirar, o usuário é guiado para re-login sem travar o app.
- Todos os botões de “Assinar Premium” e “Gerenciar” passam a funcionar no celular e no desktop.
