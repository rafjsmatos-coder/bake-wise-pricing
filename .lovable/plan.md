

# Plano: Simplificação do Sistema de Assinaturas + Stripe no Admin

## Objetivo
1. **Remover verificação de trial/assinatura via Stripe** - confiar apenas no status do banco de dados (que o admin gerencia)
2. **Adicionar informações do Stripe no painel admin** - exibir dados atualizados diretamente do Stripe para facilitar o gerenciamento manual

---

## Parte 1: Simplificar Verificação de Assinatura

### Mudança Principal
Remover a verificação contra a API do Stripe na função `check-subscription`. O sistema passará a confiar **apenas no status do banco de dados**, que pode ser gerenciado pelo admin.

### Arquivo: `supabase/functions/check-subscription/index.ts`

**Antes (atual):**
- Busca assinatura no banco
- Se tiver `stripe_subscription_id`, consulta o Stripe
- Atualiza o banco baseado no status do Stripe
- Retorna o status

**Depois (simplificado):**
- Busca assinatura no banco
- Retorna diretamente o status do banco
- Não consulta o Stripe (elimina o erro `RangeError`)

```
┌─────────────────────────────────────────────────────────────┐
│           Fluxo Simplificado de Verificação                 │
│                                                              │
│   1. Usuário acessa o app                                   │
│   2. Frontend chama check-subscription                       │
│   3. Função busca status no banco                           │
│   4. Retorna: subscribed=true se status='trial'/'active'    │
│   5. Se status='expired'/'canceled' → mostra paywall        │
│                                                              │
│   Admin pode alterar o status manualmente a qualquer momento│
└─────────────────────────────────────────────────────────────┘
```

### Lógica Simplificada:
```typescript
// Se não existe assinatura, cria trial
// Se status = 'trial' e dias > 0 → subscribed = true
// Se status = 'active' → subscribed = true
// Se status = 'expired' ou 'canceled' → subscribed = false
```

---

## Parte 2: Exibir Informações do Stripe no Admin

### Novo Recurso
Adicionar uma seção no painel admin que mostra dados **em tempo real do Stripe** para cada usuário:

- Status real da assinatura no Stripe
- Data de próxima cobrança
- Valor do plano
- Histórico de pagamentos recentes

### Arquivos a Modificar

#### 1. Backend: `supabase/functions/admin-users/index.ts`
Adicionar nova action: `getStripeInfo`

```typescript
case "getStripeInfo": {
  const { email, stripeCustomerId } = params;
  
  // Busca cliente no Stripe pelo email ou ID
  // Retorna:
  //   - customer: { id, email, created, default_payment_method }
  //   - subscriptions: [{ id, status, current_period_end, plan }]
  //   - invoices: [{ id, status, amount_paid, created }] (últimas 5)
}
```

#### 2. Frontend: `src/components/admin/UserDetailsModal.tsx`
Adicionar nova aba: **"Stripe"** com as informações buscadas

```
┌─────────────────────────────────────────────────────────────┐
│                    Detalhes do Usuário                      │
│  ┌────────┐ ┌────────────┐ ┌────────┐ ┌─────────┐          │
│  │ Perfil │ │ Assinatura │ │  Dados │ │ Stripe  │          │
│  └────────┘ └────────────┘ └────────┘ └─────────┘          │
│                                                              │
│  ═══════════════════════════════════════════════════════    │
│  Aba "Stripe" (nova):                                        │
│                                                              │
│  Status no Stripe              [ 🟢 active ]                │
│  Customer ID                   cus_TriKmfFI5gUrCD           │
│  Subscription ID               sub_1Stytr...                │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  Próxima Cobrança              26/02/2026                   │
│  Valor                         R$ 49,90                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  Últimos Pagamentos:                                         │
│  • 26/01/2026 - R$ 49,90 - ✅ Pago                          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  [ 🔗 Abrir no Stripe Dashboard ]                           │
│                                                              │
│  [ 🔄 Sincronizar Status ]                                  │
│  (Copia status do Stripe para o banco de dados)             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Botão "Sincronizar Status"
Permite que o admin force a sincronização:
- Busca o status atual no Stripe
- Atualiza a tabela `subscriptions` no banco
- Atualiza `stripe_customer_id`, `stripe_subscription_id`, `status`, `subscription_end`

---

## Parte 3: Melhorias no EditSubscriptionDialog

### Arquivo: `src/components/admin/EditSubscriptionDialog.tsx`

Adicionar campos para editar os IDs do Stripe manualmente:

```
┌─────────────────────────────────────────────────────────────┐
│                   Editar Assinatura                          │
│                                                              │
│  Status:           [ Active ▼ ]                             │
│                                                              │
│  Fim do Trial:     [ 26/01/2026 📅 ]                        │
│  Fim Assinatura:   [ 26/02/2026 📅 ]                        │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  IDs do Stripe (opcional):                                  │
│                                                              │
│  Customer ID:      [ cus_TriKmfFI5gUrCD ]                   │
│  Subscription ID:  [ sub_1Stytr1UfMJqJ1ycJbNT665X ]         │
│  Product ID:       [ prod_TrfaAKNLqC8XfO ]                  │
│                                                              │
│             [ Cancelar ]  [ Salvar ]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Alterações

### Backend (Edge Functions)
| Arquivo | Alteração |
|---------|-----------|
| `check-subscription/index.ts` | Remover consulta ao Stripe, usar apenas banco |
| `admin-users/index.ts` | Adicionar action `getStripeInfo` e `syncFromStripe` |

### Frontend
| Arquivo | Alteração |
|---------|-----------|
| `UserDetailsModal.tsx` | Adicionar aba "Stripe" com dados em tempo real |
| `EditSubscriptionDialog.tsx` | Adicionar campos para IDs do Stripe |

---

## Benefícios da Solução

1. **Simplicidade**: O sistema não depende mais da sincronização automática Stripe-banco
2. **Controle Total**: Admin pode ver e editar todos os dados manualmente
3. **Visibilidade**: Informações do Stripe ficam acessíveis diretamente no painel
4. **Sem Erros de Sincronização**: Elimina os problemas de `RangeError` e webhooks falhando
5. **Recuperação Fácil**: Botão "Sincronizar" permite corrigir inconsistências rapidamente

---

## Fluxo de Trabalho do Admin (após implementação)

1. Cliente compra assinatura no Stripe
2. Admin acessa o painel → Aba Usuários
3. Busca o cliente pelo email
4. Clica em "Ver Detalhes" → Aba "Stripe"
5. Visualiza status real no Stripe
6. Clica em "Sincronizar Status" para atualizar o banco
7. Cliente agora tem acesso liberado

Ou alternativamente:
1. Admin edita a assinatura manualmente
2. Define status = "active" e datas corretas
3. Salva → cliente tem acesso imediato

