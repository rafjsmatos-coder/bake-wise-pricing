
# Plano de Correção: Loop de Carregamento Infinito

## Diagnóstico Final

Após análise profunda do código, identifiquei os seguintes problemas:

### Problema Principal: Loop Infinito no `useAdminRole`

No arquivo `src/hooks/useAdminRole.tsx`, linha 97:

```typescript
useEffect(() => {
  // ...
  checkAdminRole();
  return () => subscription.unsubscribe();
}, [checkAdminRole, lastCheckedUserId]); // ← PROBLEMA AQUI
```

O `lastCheckedUserId` é uma dependência do `useEffect`, mas é alterado dentro do `checkAdminRole`:

1. `useEffect` executa → chama `checkAdminRole()`
2. `checkAdminRole()` chama `setLastCheckedUserId(data?.userId)`
3. `lastCheckedUserId` muda → `useEffect` re-executa
4. Volta ao passo 1 → **Loop infinito**

### Problema Secundário: Sincronização Auth/Admin

O `useAdminRole` e o `useAuth` ambos usam `onAuthStateChange`, o que pode causar condições de corrida durante a inicialização.

---

## Solução Proposta

### 1. Corrigir o loop infinito no `useAdminRole`

**Arquivo:** `src/hooks/useAdminRole.tsx`

Remover `lastCheckedUserId` das dependências do `useEffect` e usar uma ref para rastrear o último usuário verificado:

```typescript
const lastCheckedUserIdRef = useRef<string | null>(null);

const checkAdminRole = useCallback(async () => {
  setIsLoading(true);
  
  const freshToken = await getFreshAccessToken();

  if (!freshToken) {
    setIsAdmin(false);
    setIsLoading(false);
    lastCheckedUserIdRef.current = null;
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('check-admin-role', {
      headers: { Authorization: `Bearer ${freshToken}` },
    });

    if (error) {
      setIsAdmin(false);
    } else if (data?.code === 'unauthenticated') {
      setIsAdmin(false);
    } else {
      setIsAdmin(data?.isAdmin || false);
      lastCheckedUserIdRef.current = data?.userId || null;
    }
  } catch (err) {
    setIsAdmin(false);
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id !== lastCheckedUserIdRef.current) {
        await checkAdminRole();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsLoading(false);
        lastCheckedUserIdRef.current = null;
      }
    }
  );

  // Initial check
  checkAdminRole();

  return () => subscription.unsubscribe();
}, [checkAdminRole]); // ← SEM lastCheckedUserId
```

### 2. Adicionar timeout de segurança no `useAdminRole`

Para garantir que nunca fique travado:

```typescript
const ADMIN_CHECK_TIMEOUT = 5000; // 5 segundos

const checkAdminRole = useCallback(async () => {
  setIsLoading(true);
  
  // Timeout failsafe
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), ADMIN_CHECK_TIMEOUT);
  });

  const freshToken = await Promise.race([
    getFreshAccessToken(),
    timeoutPromise
  ]);

  if (!freshToken) {
    setIsAdmin(false);
    setIsLoading(false);
    return;
  }
  // ... resto do código
}, []);
```

### 3. Verificar/Manter a versão do SDK nas Edge Functions

Os logs mostram que `getClaims` está funcionando. Manter como está, mas adicionar fallback para `getUser` caso falhe:

**Arquivo:** `supabase/functions/_shared/auth.ts`

```typescript
try {
  // Try getClaims first (newer method)
  const { data, error } = await supabase.auth.getClaims(token);
  
  if (!error && data?.claims) {
    const userId = data.claims.sub as string;
    const email = data.claims.email as string;
    return { user: { id: userId, email: email || '' }, error: null };
  }
  
  // Fallback to getUser if getClaims fails
  logStep("getClaims failed, trying getUser");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !userData.user) {
    return { user: null, error: userError?.message || "Authentication failed" };
  }
  
  return {
    user: { id: userData.user.id, email: userData.user.email || '' },
    error: null,
  };
} catch (err) {
  // ... error handling
}
```

---

## Arquivos a Serem Modificados

1. **`src/hooks/useAdminRole.tsx`** - Corrigir loop infinito removendo `lastCheckedUserId` das dependências do useEffect, usando useRef
2. **`supabase/functions/_shared/auth.ts`** - Adicionar fallback de `getUser` para `getClaims`

---

## Critérios de Aceite

Após as correções:

1. ✅ Acessar `/` deslogado → Landing page aparece (sem spinner infinito)
2. ✅ Acessar `/` logado → Dashboard carrega em até 5 segundos (sem spinner infinito)
3. ✅ Pressionar F5 em qualquer estado → Página recarrega corretamente
4. ✅ Se houver erro de rede → Tela de erro com botão "Tentar novamente" aparece (não spinner infinito)

---

## Ordem de Implementação

1. Primeiro: Corrigir `useAdminRole.tsx` (problema principal do loop)
2. Segundo: Atualizar `auth.ts` com fallback (defesa em profundidade)
3. Terceiro: Testar no preview
4. Quarto: Publicar para produção
