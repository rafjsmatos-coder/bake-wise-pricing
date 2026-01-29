# Sistema de Assinaturas - PreciBake

## Status: ✅ Implementado

---

## Modelo de Negócio

| Item | Valor |
|------|-------|
| Trial | 7 dias grátis |
| Plano Premium | R$ 49,90/mês |
| Pagamentos | Cartão de crédito + Boleto |
| Produto Stripe | `prod_TqveXZbKMEctFq` |
| Price ID | `price_1StDnC1UfMJqJ1ycnqShIkOZ` |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ASSINATURA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NOVO USUÁRIO                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐                                                │
│  │  Cadastro   │                                                │
│  └─────────────┘                                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │  TRIAL (7 dias)     │◄──── Trigger automático                │
│  │  Acesso completo    │                                        │
│  └─────────────────────┘                                        │
│       │                                                         │
│       │ Trial expira                                            │
│       ▼                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │  BLOQUEADO          │────────►│  Pagar R$ 49,90     │        │
│  │  Paywall aparece    │         │  (Stripe Checkout)  │        │
│  └─────────────────────┘         └─────────────────────┘        │
│                                          │                      │
│                                          ▼                      │
│                                  ┌─────────────────────┐        │
│                                  │  PREMIUM (mensal)   │        │
│                                  │  Acesso completo    │        │
│                                  └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Implementados

### Banco de Dados
- **Tabela `subscriptions`**: status, trial_ends_at, subscription_ends_at, stripe_customer_id
- **Trigger**: Cria trial automático ao criar profile

### Edge Functions
| Função | Descrição |
|--------|-----------|
| `check-subscription` | Verifica status da assinatura |
| `create-checkout` | Cria sessão Stripe (cartão + boleto) |
| `customer-portal` | Portal de gerenciamento Stripe |
| `verify-checkout` | Verifica pagamento após checkout |
| `admin-users` | Gestão de usuários e assinaturas (admin) |

### Frontend
| Componente | Descrição |
|------------|-----------|
| `useSubscription` | Hook para estado de assinatura |
| `SubscriptionPaywall` | Tela de bloqueio quando expira |
| `TrialBanner` | Banner mostrando dias restantes |
| `SubscriptionSuccess` | Página de confirmação pós-pagamento |
| `UserManagement` | Gestão de assinaturas pelo admin |

---

## Funcionalidades do Admin

O admin pode:
1. **Ver status** de assinatura de todos os usuários
2. **Estender trial** por X dias
3. **Ativar premium** manualmente (30 dias)
4. **Sincronizar** dados do Stripe
5. **Gerenciar** roles (admin/user)
6. **Deletar** usuários

---

## Status de Assinatura

| Status | Descrição | Acesso |
|--------|-----------|--------|
| `trial` | Período de teste | ✅ |
| `active` | Assinatura ativa | ✅ |
| `pending` | Aguardando boleto | ❌ |
| `expired` | Expirado | ❌ |
| `canceled` | Cancelado | ❌ |
