

# Auditoria do Painel Admin — Diagnóstico e Plano de Melhorias

## Estado Atual

O painel admin possui 4 seções: **Estatísticas**, **Usuários**, **Suporte** e **Novidades**. Já existe um sistema de audit logs (`admin_action_logs`) que registra ações administrativas e é exibido na aba "Histórico" do modal de detalhes do usuário.

---

## Melhorias Propostas

### 1. Aba dedicada "Logs de Auditoria" no painel admin
Atualmente os logs só aparecem dentro do modal de cada usuário. Criar uma 5ª aba no sidebar admin com visão global de todos os logs, com:
- Tabela cronológica de todas as ações admin
- Filtros por: tipo de ação, admin responsável, período
- Busca por email/nome do usuário afetado
- Exportação (CSV)

### 2. Estatísticas mais ricas
- **Taxa de conversão**: Trial → Premium (%)
- **Churn rate**: cancelamentos no período
- **Retenção**: usuários ativos nos últimos 7/30 dias
- **Receita estimada**: baseada nos premium ativos
- **Gráfico de funil**: cadastros → trial → premium → cancelados
- **Filtro por período** nos gráficos

### 3. Notificações admin em tempo real
- Badge no sidebar com contagem de tickets pendentes (já existe parcialmente)
- Notificações push para admin quando novo ticket/sugestão chega
- Alerta visual quando trial de um usuário está prestes a expirar (próximos 3 dias)

### 4. Gestão de Suporte aprimorada
- **Tempo médio de resposta** por ticket
- **SLA visual**: destaque tickets sem resposta há mais de 24h/48h
- Atribuição de tickets a admin específico
- Templates de resposta rápida

### 5. Dashboard de atividade dos usuários
- Lista dos usuários mais ativos (por contagem de registros)
- Usuários inativos há X dias (possíveis churns)
- Últimos logins

### 6. Segurança e compliance
- Log de tentativas de acesso ao painel admin (falhas)
- Sessões ativas do admin
- Two-factor authentication para admins

---

## Detalhes Técnicos

### Aba de Audit Logs (prioridade alta)
- Novo item `'audit'` no tipo `AdminPageType` do `AdminLayout.tsx`
- Novo componente `AuditLogsManagement.tsx` que consulta `admin_action_logs` via edge function
- Adicionar action `'listLogs'` no `admin-users/index.ts` com paginação e filtros
- Nova query na edge function com JOINs para resolver nomes de admin e target user

### Estatísticas avançadas
- Expandir action `'stats'` na edge function para calcular conversão, churn, retenção
- Adicionar gráficos de funil e linha temporal com Recharts (já instalado)

### SLA no Suporte
- Calcular tempo desde criação vs última resposta admin no `SupportManagement.tsx`
- Highlight visual (vermelho) para tickets sem resposta > 24h

---

## Prioridade sugerida

| # | Melhoria | Esforço | Impacto |
|---|----------|---------|---------|
| 1 | Aba de Audit Logs global | Médio | Alto |
| 2 | Estatísticas avançadas (conversão, churn) | Médio | Alto |
| 3 | SLA visual no suporte | Baixo | Médio |
| 4 | Dashboard de atividade dos usuários | Médio | Médio |
| 5 | Notificações push para admin | Alto | Médio |
| 6 | Segurança (2FA, logs de acesso) | Alto | Alto |

