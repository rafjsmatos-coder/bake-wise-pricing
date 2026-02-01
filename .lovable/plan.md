

# Plano: Separar Login do Admin dos Usuários

## Objetivo

Criar um portal de login exclusivo para administradores em uma rota separada (`/admin`), completamente isolado do login de usuários normais. Isso aumenta a segurança ao:

1. Esconder a existência do painel admin de usuários comuns
2. Evitar que usuários normais tentem acessar funcionalidades de admin
3. Simplificar o fluxo - sem necessidade de verificar role no login principal

---

## Arquitetura Proposta

```text
ROTAS:
┌─────────────────────────────────────────────────────────────┐
│  /                  → Landing Page (público)                │
│  /                  → Dashboard (usuário logado)            │
│  /dashboard         → Dashboard (usuário logado)            │
│                                                             │
│  /admin             → Login Admin (porta de entrada)        │
│  /admin             → Admin Panel (admin logado)            │
└─────────────────────────────────────────────────────────────┘

FLUXO USUÁRIO NORMAL:
Landing → Clica "Começar" → AuthForm → Dashboard

FLUXO ADMIN:
/admin → AdminAuthForm → Verifica role → AdminDashboard
                         └→ Se não for admin: "Acesso negado"
```

---

## O Que Muda

### 1. Novo Componente: `AdminAuthForm.tsx`

Formulário de login exclusivo para admins:
- Visual diferenciado (cores escuras, ícone de cadeado)
- Apenas login (sem cadastro - admins são criados manualmente)
- Após login, verifica se é admin antes de permitir acesso
- Se não for admin: mostra mensagem "Acesso restrito" e faz logout

### 2. Nova Página: `AdminPortal.tsx`

Página que gerencia o fluxo `/admin`:
- Se não logado → mostra `AdminAuthForm`
- Se logado + é admin → mostra `AdminDashboard`
- Se logado + NÃO é admin → mostra "Acesso negado" + botão sair

### 3. Atualização: `Index.tsx`

Simplificar para nunca mostrar `AdminDashboard`:
- Remove verificação de `isAdmin` e `useAdminRole`
- Usuários normais vão direto para Dashboard
- Admins precisam acessar `/admin` separadamente

### 4. Atualização: `App.tsx`

Adicionar nova rota:
- `/admin` → `AdminPortal`

### 5. Otimização: Remover `AdminRoleProvider` do contexto global

Como a verificação de admin só acontece na rota `/admin`:
- Mover o provider para dentro do `AdminPortal` apenas
- Reduz overhead no carregamento para usuários normais

---

## Benefícios de Segurança

1. **Obscuridade**: Usuários normais não sabem que `/admin` existe
2. **Isolamento**: Código de admin não é carregado para usuários normais
3. **Velocidade**: Sem verificação de role no boot para usuários normais
4. **Clareza**: Dois fluxos distintos, fáceis de manter

---

## Arquivos a Serem Criados/Modificados

### Novos arquivos:
- `src/components/auth/AdminAuthForm.tsx` - Formulário de login admin
- `src/pages/AdminPortal.tsx` - Página que gerencia `/admin`

### Arquivos modificados:
- `src/App.tsx` - Adicionar rota `/admin`
- `src/pages/Index.tsx` - Remover lógica de admin

---

## Detalhes Técnicos

### AdminAuthForm.tsx

```typescript
// Componente com:
// - Input de email e senha
// - Após login, chama checkAdminRole()
// - Se não for admin: toast de erro + signOut
// - Visual escuro para diferenciar
```

### AdminPortal.tsx

```typescript
// Fluxo:
// 1. Se !user → mostra AdminAuthForm
// 2. Se user && isLoading → spinner
// 3. Se user && !isAdmin → "Acesso negado"
// 4. Se user && isAdmin → AdminDashboard
```

### Index.tsx (simplificado)

```typescript
// Remove: useAdminRole, isAdmin, isAdminLoading
// Apenas:
// - !user → Landing/AuthForm
// - user → Dashboard
```

---

## Resultado Final

**Para usuários normais:**
- Acessa `/` → vê landing → faz login → vê dashboard
- Nunca vê nada relacionado a admin
- Carregamento mais rápido (sem checar role)

**Para admin (você):**
- Acessa `/admin` → login especial → painel administrativo
- Rota secreta, totalmente separada
- Se tentar logar com conta normal: "Acesso negado"

---

## Próximos Passos Após Implementação

1. Testar login como usuário normal em `/`
2. Testar login como admin em `/admin`
3. Testar tentativa de login como usuário normal em `/admin` (deve negar)
4. Publicar para produção

