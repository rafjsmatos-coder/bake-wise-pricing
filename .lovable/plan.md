
# Plano: Limpeza Total do Sistema de Assinaturas + Separação Admin/Usuário

## Objetivo
1. Remover todas as Edge Functions relacionadas a assinatura/Stripe
2. Limpar a Edge Function `admin-users` de referências a assinatura/Stripe
3. Separar o painel Admin do painel de Usuário (experiências diferentes)
4. Configurar Rafael como Admin e Pamella como Usuário

---

## Parte 1: Remoção de Edge Functions

### Edge Functions a Deletar:
| Função | Descrição | Ação |
|--------|-----------|------|
| `check-subscription/` | Verifica status de assinatura | Deletar |
| `create-checkout/` | Cria checkout do Stripe | Deletar |
| `customer-portal/` | Portal de billing do Stripe | Deletar |
| `stripe-webhook/` | Processa webhooks do Stripe | Deletar |

### Comando de Remoção:
Usar a ferramenta `supabase--delete_edge_functions` para remover:
- `check-subscription`
- `create-checkout`
- `customer-portal`
- `stripe-webhook`

---

## Parte 2: Limpeza da Edge Function admin-users

### Ações a Remover:
```
┌─────────────────────────────────────────────────────────────┐
│  Ações Atuais do admin-users:                               │
│                                                              │
│  ✅ list           → Manter (sem subscription data)         │
│  ❌ stats          → Remover (usa subscriptions)            │
│  ✅ toggleAdmin    → Manter                                  │
│  ✅ getUserDetails → Manter (sem subscription)               │
│  ❌ updateSubscription → Remover                             │
│  ❌ extendTrial    → Remover                                 │
│  ✅ deleteUser     → Manter                                  │
│  ❌ getStripeInfo  → Remover                                 │
│  ❌ syncFromStripe → Remover                                 │
│  NEW updateProfile → Adicionar (editar nome/negócio)        │
└─────────────────────────────────────────────────────────────┘
```

### Mudanças no Código:
1. Remover import do Stripe
2. Remover referências à tabela `subscriptions`
3. Remover ações: `stats`, `updateSubscription`, `extendTrial`, `getStripeInfo`, `syncFromStripe`
4. Adicionar ação: `updateProfile` (editar nome/negócio do usuário)
5. Simplificar `list` e `getUserDetails` para não incluir dados de assinatura

---

## Parte 3: Separação Admin vs Usuário

### Arquitetura Proposta:

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN (Rafael)                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Painel Admin                         │    │
│  │                                                      │    │
│  │  • Lista de Usuários                                 │    │
│  │  • Ver detalhes do usuário                          │    │
│  │  • Editar nome/negócio                              │    │
│  │  • Alterar roles (admin/user)                       │    │
│  │  • Excluir usuário                                  │    │
│  │  • Gerenciar tickets de suporte                     │    │
│  │                                                      │    │
│  │  NÃO TEM: Receitas, Produtos, Ingredientes, etc.   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   USUÁRIO (Pamella)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Dashboard PreciBake                    │    │
│  │                                                      │    │
│  │  • Dashboard com estatísticas                        │    │
│  │  • Produtos e categorias                            │    │
│  │  • Receitas e categorias                            │    │
│  │  • Ingredientes e categorias                        │    │
│  │  • Decorações e categorias                          │    │
│  │  • Embalagens e categorias                          │    │
│  │  • Configurações de precificação                    │    │
│  │  • Perfil pessoal                                   │    │
│  │  • Suporte (criar tickets)                          │    │
│  │                                                      │    │
│  │  NÃO TEM: Painel Admin                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Mudanças no Frontend:

#### src/pages/Index.tsx
- Verificar se usuário é admin após login
- Admin → redirecionar para painel admin dedicado
- Usuário → redirecionar para Dashboard normal

#### src/pages/Dashboard.tsx
- Manter apenas para usuários normais
- Admin não acessa este componente

#### Novo: src/pages/AdminDashboard.tsx
- Dashboard exclusivo para admins
- Contém apenas: UserManagement + SupportManagement
- Layout simplificado sem menu de produtos/receitas

#### src/components/layout/AppLayout.tsx
- Remover item "Admin" do menu (será separado)
- Continua servindo apenas usuários normais

#### Novo: src/components/layout/AdminLayout.tsx
- Layout exclusivo para admins
- Menu com: Usuários, Suporte, Sair
- Sem acesso a funções de precificação

---

## Parte 4: Configuração de Roles no Banco

### Estado Atual:
| Usuário | Email | ID | Role Atual |
|---------|-------|-----|------------|
| Rafael | rafaeljuniorpis@gmail.com | 881da8e6-... | Nenhum |
| Pamella | p.souza1794@gmail.com | 26e1d0f1-... | admin |

### Estado Desejado:
| Usuário | Email | ID | Role Novo |
|---------|-------|-----|-----------|
| Rafael | rafaeljuniorpis@gmail.com | 881da8e6-... | **admin** |
| Pamella | p.souza1794@gmail.com | 26e1d0f1-... | **user** (remover admin) |

### SQL para Atualizar:
```sql
-- Remover role de admin da Pamella
DELETE FROM user_roles 
WHERE user_id = '26e1d0f1-f02d-4d52-9821-ca8d19d7662f' 
AND role = 'admin';

-- Adicionar role de admin ao Rafael
INSERT INTO user_roles (user_id, role)
VALUES ('881da8e6-e4af-4e25-9138-1094c0c25e71', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Parte 5: Limpeza de Componentes Frontend

### Arquivos a Modificar:
| Arquivo | Ação |
|---------|------|
| `src/components/admin/UserManagement.tsx` | Remover referências a subscription status |
| `src/components/admin/UserDetailsModal.tsx` | Remover aba de assinatura/Stripe |
| `src/components/admin/AdminStats.tsx` | Remover ou adaptar (se existir) |

### Arquivos que podem ser removidos (verificar dependências):
- Qualquer componente em `src/components/subscription/` que ainda exista

---

## Resumo das Ações

### Backend:
1. Deletar 4 Edge Functions de assinatura
2. Reescrever `admin-users/index.ts` sem Stripe/assinatura
3. Executar SQL para configurar roles

### Frontend:
1. Criar `AdminDashboard.tsx` - dashboard exclusivo admin
2. Criar `AdminLayout.tsx` - layout exclusivo admin
3. Modificar `Index.tsx` - separar fluxo admin vs usuário
4. Limpar `UserManagement.tsx` e `UserDetailsModal.tsx`
5. Remover item "Admin" do menu de usuários

---

## Fluxo Final

```
Usuário faz Login
       │
       ▼
  É Admin?
    │    │
   SIM   NÃO
    │     │
    ▼     ▼
AdminDashboard  Dashboard
(Gerenciar     (Precificar
 Usuários)      Produtos)
```
