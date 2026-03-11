

# Plano: Corrigir preço no TrialBanner + Abrir AuthForm na aba de registro

## Problemas encontrados

### 1. Preço inconsistente no TrialBanner
O `TrialBanner.tsx` (linha 60) exibe sempre **"Assinar por R$ 49,90"**, ignorando a promoção ativa. Todos os outros componentes (`PricingSection`, `SubscriptionPaywall`, `SubscriptionCard`) já usam `usePromoStatus()` para mostrar R$ 29,90 quando a promo está ativa. O TrialBanner não.

### 2. Botão "Começar" abre aba de Login em vez de Registro
O `onGetStarted` da landing page chama `setShowAuthForm(true)` → renderiza `<AuthForm />`. O `AuthForm` usa `<Tabs defaultValue="signin">`, então sempre abre na aba "Entrar". Quando o usuário clica "Começar Teste Grátis" ou "Criar Conta", deveria abrir na aba "Criar Conta" (`signup`).

### 3. Valores nos demais locais — OK
- `PricingSection`: ✅ Usa `usePromoStatus`, mostra R$ 29,90 promo / R$ 49,90 normal
- `SubscriptionPaywall`: ✅ Usa `usePromoStatus`, mostra R$ 29,90 promo / R$ 49,90 normal  
- `SubscriptionCard`: ✅ Usa `usePromoStatus`, mostra R$ 29,90 promo / R$ 49,90 normal
- `index.html` Schema.org: ✅ Preço base R$ 49,90 (correto para SEO)
- `TermsOfService`: ✅ Menciona R$ 49,90 (preço padrão)
- `create-checkout` edge function: ✅ Lógica de cupom aplica R$ 29,90 automaticamente

---

## Plano de execução

### Correção 1 — TrialBanner: mostrar preço promo quando ativa
**Arquivo**: `src/components/subscription/TrialBanner.tsx`
- Importar e usar `usePromoStatus()`
- Linha 60: trocar texto fixo por dinâmico — se promo ativa, mostrar "Assinar por R$ 29,90", senão "Assinar por R$ 49,90"
- **Risco**: Zero. Mesmo padrão já usado nos outros 3 componentes.

### Correção 2 — AuthForm: aceitar tab inicial como prop
**Arquivos**: `src/components/auth/AuthForm.tsx`, `src/pages/Index.tsx`
- Adicionar prop `defaultTab?: 'signin' | 'signup'` ao `AuthForm`
- Usar essa prop no `<Tabs defaultValue={defaultTab ?? 'signin'}>`
- No `Index.tsx`, passar `defaultTab="signup"` quando vem do `onGetStarted`
- **Risco**: Zero. Apenas muda a aba padrão visível. Nenhuma lógica de auth alterada.

### Nenhuma outra alteração
- Sem mudança em regras de negócio, layout, edge functions ou banco de dados.

