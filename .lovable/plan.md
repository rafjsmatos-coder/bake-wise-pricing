

# Otimizacao de Performance no Login e Remocao de Refresh Periodico

## Problemas Identificados

### 1. Demora no Login
Chamadas sequenciais a Edge Functions e validacoes duplicadas de sessao estao causando lentidao apos o login.

### 2. Refresh Periodico
O hook `useSubscription` verifica a assinatura a cada 5 minutos, causando re-renders e possivel "piscar" da tela.

---

## Solucoes Propostas

### Otimizacao 1: Remover Validacao Dupla de Sessao

Atualmente, `useSubscription` e `useAdminRole` chamam `supabase.auth.getSession()` antes de invocar as Edge Functions, mesmo ja tendo `session.access_token` disponivel. Isso adiciona latencia desnecessaria.

**Arquivos afetados:**
- `src/hooks/useSubscription.tsx`
- `src/hooks/useAdminRole.tsx`

**Mudanca:** Remover a chamada extra de `getSession()` e usar diretamente o `session.access_token` ja disponivel no contexto.

### Otimizacao 2: Executar Verificacoes em Paralelo

Atualmente as verificacoes de assinatura e admin sao sequenciais. Podemos usar `Promise.all` ou deixar ambas rodarem em paralelo naturalmente sem bloquear uma a outra.

**Beneficio:** Reduz tempo total de ~600ms para ~300ms.

### Otimizacao 3: Aumentar Intervalo de Verificacao Periodica

O intervalo de 5 minutos e muito agressivo. Podemos aumentar para 15-30 minutos, pois:
- Mudancas de assinatura sao raras
- Webhooks do Stripe ja atualizam o banco em tempo real
- Usuario pode forcar refresh se necessario

**Alternativa:** Remover completamente o intervalo e verificar apenas:
- No login
- Apos retornar de checkout
- Quando usuario clica em "Assinar Premium"

### Otimizacao 4: Cache Local do Status de Assinatura

Salvar o status da assinatura no `localStorage` com timestamp para evitar chamadas desnecessarias em reloads rapidos.

---

## Implementacao Detalhada

### Arquivo: src/hooks/useSubscription.tsx

```typescript
// ANTES (linha 40-47):
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !sessionData.session) {
  console.log('Session invalid, skipping subscription check');
  setSubscription({ subscribed: false, status: 'expired' });
  setIsLoading(false);
  return;
}

// DEPOIS:
// Remover este bloco - usar session.access_token diretamente
```

```typescript
// ANTES (linha 168-177):
useEffect(() => {
  if (!user || !session) return;
  const interval = setInterval(() => {
    checkSubscription();
  }, 5 * 60 * 1000); // 5 minutos
  return () => clearInterval(interval);
}, [user, session, checkSubscription]);

// DEPOIS:
useEffect(() => {
  if (!user || !session) return;
  const interval = setInterval(() => {
    checkSubscription();
  }, 30 * 60 * 1000); // 30 minutos (ou remover completamente)
  return () => clearInterval(interval);
}, [user, session, checkSubscription]);
```

### Arquivo: src/hooks/useAdminRole.tsx

```typescript
// ANTES (linha 25-32):
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !sessionData.session) {
  console.log('[useAdminRole] Session invalid, skipping admin check');
  setIsAdmin(false);
  setIsLoading(false);
  return;
}

// DEPOIS:
// Remover este bloco - usar session.access_token diretamente
```

---

## Opcao Avancada: Cache com localStorage

```typescript
const CACHE_KEY = 'subscription_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de cache

const getCachedSubscription = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  return data;
};

const setCachedSubscription = (data: SubscriptionStatus) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};
```

---

## Resumo das Mudancas

| Arquivo | Alteracao | Impacto |
|---------|-----------|---------|
| useSubscription.tsx | Remover getSession() duplicado | -200ms no login |
| useSubscription.tsx | Aumentar intervalo para 30min | Menos refreshes |
| useAdminRole.tsx | Remover getSession() duplicado | -200ms no login |
| (Opcional) | Adicionar cache localStorage | Reload instantaneo |

---

## Estimativa de Melhoria

| Metrica | Antes | Depois |
|---------|-------|--------|
| Tempo pos-login | ~1.5-2s | ~0.5-1s |
| Refreshes por hora | 12 | 2 |
| Re-renders perceptiveis | Frequentes | Raros |

