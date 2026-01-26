

# Plano: Sistema Super-Admin

## Objetivo
Implementar um sistema completo de administracao com roles de usuario, permitindo que administradores gerenciem usuarios, visualizem estatisticas do sistema e controlem assinaturas.

---

## 1. Migracao do Banco de Dados

### 1.1 Criar Enum e Tabela de Roles

```sql
-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### 1.2 Criar Funcao Security Definer

```sql
-- Funcao para verificar role (evita recursao em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 1.3 Politicas RLS

```sql
-- Usuarios podem ver suas proprias roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins podem ver todas as roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem gerenciar roles
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
```

---

## 2. Edge Functions

### 2.1 check-admin-role

**Arquivo:** `supabase/functions/check-admin-role/index.ts`

**Funcionalidade:**
- Valida o token JWT do usuario
- Consulta a tabela `user_roles` usando service role
- Retorna `{ isAdmin: true/false }`

### 2.2 admin-users

**Arquivo:** `supabase/functions/admin-users/index.ts`

**Funcionalidade:**
- Valida que o usuario requisitante e admin
- Lista todos os usuarios do sistema (via `auth.admin.listUsers`)
- Busca dados de subscriptions e profiles
- Suporta paginacao e busca por email
- Permite alterar roles de usuarios

---

## 3. Hook de Autorizacao

### 3.1 useAdminRole

**Arquivo:** `src/hooks/useAdminRole.tsx`

```typescript
interface AdminRoleContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: () => Promise<void>;
}
```

**Funcionalidade:**
- Chama edge function `check-admin-role` ao montar
- Armazena resultado em state (NAO localStorage)
- Revalida quando sessao muda

---

## 4. Componentes do Painel Admin

### 4.1 AdminPanel.tsx

**Arquivo:** `src/components/admin/AdminPanel.tsx`

**Layout:**
- Tabs: "Usuarios" | "Estatisticas"
- Verificacao de permissao no render

### 4.2 UserManagement.tsx

**Arquivo:** `src/components/admin/UserManagement.tsx`

**Funcionalidades:**
- Tabela de usuarios com colunas:
  - Email
  - Nome (do profile)
  - Status da assinatura
  - Data de criacao
  - Role (admin/user)
  - Acoes
- Filtro por email
- Filtro por status (trial/active/expired)
- Paginacao
- Acoes:
  - Promover/remover admin
  - Visualizar detalhes

### 4.3 AdminStats.tsx

**Arquivo:** `src/components/admin/AdminStats.tsx`

**Metricas:**
- Total de usuarios
- Usuarios em trial
- Usuarios pagantes (active)
- Usuarios expirados
- Grafico de novos usuarios por semana/mes

---

## 5. Integracao na Navegacao

### 5.1 Atualizar AppLayout

**Arquivo:** `src/components/layout/AppLayout.tsx`

**Modificacoes:**
- Adicionar `'admin'` ao tipo `PageType`
- Adicionar item de menu "Admin" com icone `Shield`
- Renderizar condicionalmente (apenas se `isAdmin`)

### 5.2 Atualizar Dashboard

**Arquivo:** `src/pages/Dashboard.tsx`

**Modificacoes:**
- Importar `AdminPanel`
- Adicionar caso para `currentPage === 'admin'`

---

## 6. Estrutura de Arquivos

```
src/
├── components/
│   └── admin/
│       ├── AdminPanel.tsx          (NOVO)
│       ├── UserManagement.tsx      (NOVO)
│       └── AdminStats.tsx          (NOVO)
├── hooks/
│   └── useAdminRole.tsx            (NOVO)
└── pages/
    └── Dashboard.tsx               (MODIFICAR)

src/components/layout/
└── AppLayout.tsx                   (MODIFICAR)

supabase/functions/
├── check-admin-role/
│   └── index.ts                    (NOVO)
└── admin-users/
    └── index.ts                    (NOVO)
```

---

## 7. Primeiro Admin

Apos a migracao, inserir manualmente o primeiro admin:

```sql
-- Substituir pelo seu user_id real
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

Para obter seu user_id, verificar na tabela `profiles` ou `subscriptions`.

---

## 8. Fluxo de Seguranca

```text
Usuario acessa /admin
        |
        v
useAdminRole chama edge function
        |
        v
Edge function valida JWT via getUser()
        |
        v
Consulta user_roles com service role
        |
        v
Retorna { isAdmin: true/false }
        |
        v
Se false: redireciona para dashboard
Se true: renderiza AdminPanel
```

---

## 9. Ordem de Implementacao

1. **Migracao SQL** - Criar tabela, enum, funcao e politicas
2. **Edge function check-admin-role** - Validacao de admin
3. **Hook useAdminRole** - Client-side state
4. **Edge function admin-users** - Listagem e gerenciamento
5. **Componentes Admin** - UI do painel
6. **Integracao Layout** - Menu e rotas
7. **Primeiro Admin** - Inserir via SQL

---

## Consideracoes de Seguranca

- Validacao de admin SEMPRE via edge function (server-side)
- Nunca confiar em dados do client (localStorage, state)
- Usar service role apenas nas edge functions
- RLS protege acesso direto ao banco
- Funcao security definer evita recursao

