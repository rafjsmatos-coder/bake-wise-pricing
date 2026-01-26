
# Plano: Gerenciamento Completo de Usuarios no Painel Admin

## Objetivo
Expandir o painel administrativo com funcionalidades para gerenciar assinaturas, visualizar detalhes completos de usuarios e deletar usuarios do sistema.

---

## 1. Novas Acoes na Edge Function admin-users

### 1.1 Acao: updateSubscription

Permite alterar manualmente o status e datas de assinatura de um usuario.

```typescript
case "updateSubscription": {
  const { userId, status, trialEnd, subscriptionEnd } = params;
  
  // Atualizar tabela subscriptions com service role
  await supabaseAdmin
    .from("subscriptions")
    .update({
      status,
      trial_end: trialEnd,
      subscription_end: subscriptionEnd
    })
    .eq("user_id", userId);
}
```

**Campos editaveis:**
- `status`: trial, active, expired, canceled
- `trial_end`: Data de fim do trial
- `subscription_end`: Data de fim da assinatura

### 1.2 Acao: extendTrial

Atalho para estender o periodo de trial de um usuario.

```typescript
case "extendTrial": {
  const { userId, days } = params;
  
  // Busca trial_end atual e adiciona dias
  // Atualiza com nova data e status = 'trial'
}
```

### 1.3 Acao: getUserDetails

Retorna todas as informacoes de um usuario especifico.

```typescript
case "getUserDetails": {
  const { userId } = params;
  
  // Retorna:
  // - Dados do auth (email, created_at, last_sign_in)
  // - Profile completo
  // - Subscription completa
  // - Roles
  // - Contagem de dados (ingredientes, receitas, produtos)
}
```

### 1.4 Acao: deleteUser

Deleta um usuario e todos os dados associados.

```typescript
case "deleteUser": {
  const { userId } = params;
  
  // Nao pode deletar a si mesmo
  // Nao pode deletar outro admin
  
  // Deleta usuario via auth.admin.deleteUser()
  // Cascade deleta profiles, subscriptions, etc.
}
```

---

## 2. Migracao SQL

### 2.1 Permitir UPDATE na tabela subscriptions para admins

Atualmente a tabela `subscriptions` nao tem politica de UPDATE. Como usamos service role na edge function, isso nao e problema, mas documentamos aqui para clareza.

**Nao e necessaria migracao** - service role bypassa RLS.

---

## 3. Novos Componentes UI

### 3.1 UserDetailsModal

**Arquivo:** `src/components/admin/UserDetailsModal.tsx`

Modal com abas mostrando:
- **Perfil**: Nome, negocio, contato, endereco, redes sociais
- **Assinatura**: Status, datas, ID Stripe (se houver)
- **Dados**: Contagem de ingredientes, receitas, produtos, embalagens
- **Acoes**: Botoes para acoes rapidas

### 3.2 EditSubscriptionDialog

**Arquivo:** `src/components/admin/EditSubscriptionDialog.tsx`

Formulario para editar:
- Status (Select: trial, active, expired, canceled)
- Data fim do trial (DatePicker)
- Data fim da assinatura (DatePicker)

### 3.3 ExtendTrialDialog

**Arquivo:** `src/components/admin/ExtendTrialDialog.tsx`

Formulario simples:
- Input numerico: quantidade de dias
- Botao confirmar

### 3.4 DeleteUserDialog

**Arquivo:** `src/components/admin/DeleteUserDialog.tsx`

Confirmacao com:
- Aviso sobre dados que serao deletados
- Campo para digitar email do usuario como confirmacao
- Botao destrutivo

---

## 4. Atualizacoes no UserManagement

### 4.1 Coluna de Acoes Expandida

Adicionar dropdown menu com:
- Ver Detalhes
- Editar Assinatura
- Estender Trial (se status = trial ou expired)
- Promover/Remover Admin
- Deletar Usuario

### 4.2 Integracao com Modais

Estados para controlar abertura de cada modal/dialog.

---

## 5. Estrutura de Arquivos

```
src/components/admin/
├── AdminPanel.tsx              (existente)
├── AdminStats.tsx              (existente)
├── UserManagement.tsx          (MODIFICAR)
├── UserDetailsModal.tsx        (NOVO)
├── EditSubscriptionDialog.tsx  (NOVO)
├── ExtendTrialDialog.tsx       (NOVO)
└── DeleteUserDialog.tsx        (NOVO)

supabase/functions/
└── admin-users/
    └── index.ts                (MODIFICAR)
```

---

## 6. Fluxo de Seguranca

```text
Admin clica em acao
        |
        v
Frontend envia request com JWT
        |
        v
Edge function valida admin via user_roles
        |
        v
Executa acao com service role
        |
        v
Retorna resultado
        |
        v
Frontend atualiza lista
```

**Protecoes:**
- Nao pode deletar a si mesmo
- Nao pode deletar outro admin
- Todas as acoes logadas no console da edge function

---

## 7. Interface do Dropdown de Acoes

```
[Acoes v]
├── 👁 Ver Detalhes
├── ✏️ Editar Assinatura
├── ⏰ Estender Trial
├── ─────────────────
├── 🛡 Promover Admin / Remover Admin
├── ─────────────────
└── 🗑 Deletar Usuario (vermelho)
```

---

## 8. Ordem de Implementacao

1. **Edge Function** - Adicionar novas acoes (updateSubscription, extendTrial, getUserDetails, deleteUser)
2. **UserDetailsModal** - Modal de visualizacao
3. **EditSubscriptionDialog** - Formulario de edicao
4. **ExtendTrialDialog** - Atalho para trial
5. **DeleteUserDialog** - Confirmacao de exclusao
6. **UserManagement** - Integrar dropdown e modais
7. **Testes** - Validar todas as acoes

---

## Resumo de Funcionalidades

| Funcionalidade | Status Atual | Apos Implementacao |
|----------------|--------------|-------------------|
| Listar usuarios | OK | OK |
| Buscar por email/nome | OK | OK |
| Filtrar por status | OK | OK |
| Promover/Remover admin | OK | OK |
| Ver detalhes completos | - | NOVO |
| Editar status assinatura | - | NOVO |
| Alterar datas assinatura | - | NOVO |
| Estender trial | - | NOVO |
| Deletar usuario | - | NOVO |

