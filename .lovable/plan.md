

## Plano: Relatórios Avançados + Notificações Push PWA

### 1. Relatórios Avançados

O `RevenueReport.tsx` já tem: faturamento mensal, despesas, lucro líquido, top 5 produtos, top 5 clientes e gráfico de barras dos últimos 6 meses.

**Novos relatórios a adicionar:**

| Relatório | Descrição |
|-----------|-----------|
| Margem de lucro por produto | Tabela com custo, preço de venda, margem % de cada produto vendido no período |
| Comparativo mensal | Indicadores de variação vs mês anterior (seta verde/vermelha + %) |
| Ticket médio | Valor médio por pedido no período |
| Taxa de conversão orçamento→pedido | % de orçamentos que viraram pedidos confirmados |
| Gráfico de pizza | Distribuição de receita por categoria de produto |

**Arquivos alterados:**
- `src/components/financial/RevenueReport.tsx` -- Adicionar novos cards de métricas (ticket médio, comparativo, conversão) e gráfico de pizza por categoria
- Adicionar `PieChart` do recharts (já instalado)

---

### 2. Notificações Push (PWA)

**Arquitetura:**

```text
[Usuário abre app] → [Pede permissão push] → [Salva subscription no banco]
[Edge function cron/manual] → [Consulta entregas do dia / estoque baixo] → [Envia push via Web Push API]
```

**Etapas:**

1. **Tabela `push_subscriptions`** -- Armazena endpoint + keys por user_id
2. **Frontend: hook `usePushNotifications`** -- Solicita permissão, registra subscription no banco
3. **Edge function `send-push-notifications`** -- Consulta pedidos do dia e estoque baixo, envia push usando web-push protocol
4. **Secret: `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`** -- Necessárias para Web Push API (serão geradas automaticamente via edge function auxiliar)
5. **Configuração no perfil** -- Toggle para ativar/desativar notificações + escolher quais tipos receber

**Tipos de notificação:**
- Entregas do dia (manhã)
- Estoque baixo (ingredientes abaixo do mínimo)
- Pagamentos pendentes (pedidos com saldo devedor)

**Arquivos novos/alterados:**

| Arquivo | Mudança |
|---------|---------|
| Migration SQL | Criar tabela `push_subscriptions` com RLS |
| `src/hooks/usePushNotifications.tsx` | Hook para solicitar permissão e registrar subscription |
| `src/components/settings/NotificationSettings.tsx` | UI para ativar/desativar tipos de notificação |
| `src/components/settings/UserSettings.tsx` | Adicionar seção de notificações |
| `supabase/functions/send-push-notifications/index.ts` | Edge function que envia as notificações |
| `supabase/functions/generate-vapid-keys/index.ts` | Gerar par de chaves VAPID |
| `public/sw-push.js` | Handler de push no service worker |

**Nota:** Será necessário configurar 2 secrets (VAPID keys). Posso gerar automaticamente via edge function na primeira execução.

