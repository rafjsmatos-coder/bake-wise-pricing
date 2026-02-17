

## Expandir Autonomias do Admin

Quatro novas capacidades para dar controle total ao administrador sobre o ciclo de vida das assinaturas.

---

### 1. Cancelar/Expirar Manualmente

Adicionar opcoes no dropdown de acoes do usuario para forcar o status para "cancelado" ou "expirado", com confirmacao. Util quando um usuario solicita cancelamento direto ou quando o admin precisa revogar acesso imediatamente.

| Arquivo | Alteracao |
|---------|----------|
| `src/components/admin/UserManagement.tsx` | Adicionar opcoes "Cancelar Assinatura" e "Expirar Assinatura" no dropdown, com dialogs de confirmacao. Reutilizar o `subscriptionDialog` existente com novas actions `cancel` e `expire` |

O backend (`updateSubscription` na edge function) ja suporta qualquer status incluindo `expired` e `canceled`, e ja limpa `manual_override` nesses casos (linhas 388-391). Nenhuma alteracao no backend necessaria.

---

### 2. Premium com Duracao Customizada

Atualmente "Ativar Premium" esta fixo em 30 dias. Mudar para permitir que o admin defina a quantidade de dias, assim como ja funciona para extensao de trial.

| Arquivo | Alteracao |
|---------|----------|
| `src/components/admin/UserManagement.tsx` | No dialog de acao `activate`, mostrar campo de input de dias (igual ao extend). Passar `daysToAdd` dinamico em vez de fixo 30 |

Backend ja suporta `daysToAdd` dinamico na acao `updateSubscription`. Nenhuma alteracao no backend.

---

### 3. Remover Override Manual

Botao para limpar o `manual_override` sem alterar o status. Util quando o admin quer devolver o controle ao Stripe sem esperar expiracao.

| Arquivo | Alteracao |
|---------|----------|
| `src/components/admin/UserManagement.tsx` | Adicionar opcao "Remover Override Manual" no dropdown (so aparece se o usuario tiver `manual_override: true`). Chamar `updateSubscription` com apenas `manual_override: false` |
| `supabase/functions/admin-users/index.ts` | Na acao `updateSubscription`, aceitar campo `manualOverride` explicito para permitir definir override independentemente do status |

Tambem precisa expor `manual_override` na listagem de usuarios para o frontend saber quando mostrar a opcao.

| Arquivo | Alteracao |
|---------|----------|
| `supabase/functions/admin-users/index.ts` | Na acao `list`, incluir `manual_override` no select de subscriptions e no mapeamento retornado |

---

### 4. Log de Acoes Administrativas

Criar tabela `admin_action_logs` para registrar toda acao do admin (extensao de trial, ativacao premium, cancelamento, sync, etc.) com timestamp, admin que executou e usuario afetado.

| Arquivo | Alteracao |
|---------|----------|
| Migracao SQL | Criar tabela `admin_action_logs` com colunas: `id`, `admin_user_id`, `target_user_id`, `action`, `details` (jsonb), `created_at`. RLS: somente admins podem ler e inserir |
| `supabase/functions/admin-users/index.ts` | Adicionar funcao helper `logAdminAction()` e chamar em cada acao relevante (extendTrial, updateSubscription, syncFromStripe, toggleAdmin, deleteUser) |
| `src/components/admin/UserDetailsModal.tsx` | Adicionar aba "Historico" no modal de detalhes mostrando as ultimas acoes administrativas realizadas sobre aquele usuario |

---

### Resumo de arquivos

| Arquivo | Tipo de alteracao |
|---------|-------------------|
| Migracao SQL | Nova tabela `admin_action_logs` |
| `supabase/functions/admin-users/index.ts` | Aceitar `manualOverride` explicito, expor override na listagem, registrar logs de acao |
| `src/components/admin/UserManagement.tsx` | Novas opcoes: cancelar, expirar, premium customizado, remover override |
| `src/components/admin/UserDetailsModal.tsx` | Nova aba "Historico" com log de acoes do admin |

