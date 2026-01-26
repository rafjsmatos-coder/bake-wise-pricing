
# Correções: Sistema de Suporte e Notificações

## Problemas Identificados

### 1. Flickering na Página de Suporte
O componente `TicketDetails.tsx` usa `fetchReplies` como dependência do `useEffect`, mas essa função é recriada a cada render, causando loop infinito de re-renderização.

**Causa**: No hook `useSupport.tsx`, a função `fetchReplies` não está envolvida em `useCallback`, então cada vez que o componente re-renderiza, uma nova referência da função é criada, disparando o useEffect novamente.

### 2. Mensagem de Trial Expirado
Os logs da edge function mostram:
- `[CHECK-SUBSCRIPTION] Authentication failed - {"error":"Auth session missing!"}`
- `Subscription check returned error: Session expired`

O token do usuário pode estar expirado ou a sessão está inconsistente.

### 3. Notificações no Menu
Não existe contador de tickets/sugestões pendentes para administradores no menu.

---

## Soluções Propostas

### Correção 1: Memoizar `fetchReplies` no Hook

**Arquivo**: `src/hooks/useSupport.tsx`

Envolver a função `fetchReplies` com `useCallback` para evitar recriação desnecessária:

```typescript
const fetchReplies = useCallback(async (ticketId: string): Promise<SupportReply[]> => {
  try {
    const { data, error } = await supabase
      .from('support_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    toast({
      title: 'Erro ao carregar respostas',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }
}, [toast]);
```

### Correção 2: Remover `fetchReplies` das Dependências do useEffect

**Arquivo**: `src/components/support/TicketDetails.tsx`

Ajustar o `useEffect` para usar uma abordagem mais estável:

```typescript
useEffect(() => {
  let isMounted = true;
  
  const loadReplies = async () => {
    setIsLoading(true);
    const data = await fetchReplies(ticket.id);
    if (isMounted) {
      setReplies(data);
      setIsLoading(false);
    }
  };
  
  loadReplies();
  
  return () => {
    isMounted = false;
  };
}, [ticket.id]); // Remover fetchReplies das dependências
```

### Correção 3: Adicionar Contador de Notificações no Menu

**Arquivo**: `src/hooks/useSupport.tsx`

Adicionar função para contar tickets abertos (para admin):

```typescript
// Contadores para notificações
const openTicketsCount = tickets.filter(
  t => t.status === 'open' || t.status === 'in_progress'
).length;
```

**Arquivo**: `src/components/layout/AppLayout.tsx`

Adicionar badge de notificação no item de Suporte (apenas para admins):

```typescript
// No item de navegação "Suporte"
{ 
  id: 'support', 
  label: 'Suporte', 
  icon: Headphones,
  badge: isAdmin ? openTicketsCount : undefined 
}
```

Renderizar badge no menu:

```tsx
<span className="font-medium">{item.label}</span>
{item.badge > 0 && (
  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
    {item.badge}
  </span>
)}
```

### Correção 4: Verificar Sessão no useSubscription

**Arquivo**: `src/hooks/useSubscription.tsx`

Adicionar verificação de sessão válida antes de chamar a edge function:

```typescript
const checkSubscription = useCallback(async () => {
  if (!session?.access_token || !user) {
    setSubscription({ subscribed: false, status: 'expired' });
    setIsLoading(false);
    return;
  }

  // Verificar se o token é válido antes de fazer a chamada
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    console.log('Session invalid, skipping subscription check');
    setSubscription({ subscribed: false, status: 'expired' });
    setIsLoading(false);
    return;
  }

  // ... resto do código
}, [session?.access_token, user]);
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useSupport.tsx` | Memoizar `fetchReplies` com useCallback, adicionar contador de tickets abertos |
| `src/components/support/TicketDetails.tsx` | Remover `fetchReplies` das dependências do useEffect, adicionar cleanup |
| `src/components/layout/AppLayout.tsx` | Adicionar badge de notificação no menu para admins |
| `src/hooks/useSubscription.tsx` | Melhorar verificação de sessão antes de chamar edge function |

---

## Fluxo de Notificações (Admin)

```text
Admin faz login
       |
       v
useSupport carrega todos os tickets
       |
       v
Calcula tickets com status 'open' ou 'in_progress'
       |
       v
Passa contador para AppLayout
       |
       v
Exibe badge vermelho no item "Suporte" do menu
       |
       v
Admin clica e visualiza tickets pendentes
```

---

## Ordem de Implementação

1. **Corrigir useSupport.tsx** - Memoizar fetchReplies e adicionar contador
2. **Corrigir TicketDetails.tsx** - Ajustar useEffect para evitar loop
3. **Atualizar AppLayout.tsx** - Adicionar badge de notificação
4. **Melhorar useSubscription.tsx** - Verificação de sessão mais robusta

---

## Resultado Esperado

- Página de suporte/sugestões não pisca mais ao abrir detalhes
- Admins veem contador de tickets pendentes no menu
- Verificação de assinatura não mostra erro de sessão expirada indevidamente
- Sistema mais estável e sem re-renderizações desnecessárias
