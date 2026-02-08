
# Melhorias Gerais do PreciBake - Pacote Completo

## 1. Parar a pagina de atualizar ao trocar de aba

**Problema**: Quando o usuario troca de aba no navegador e volta, a pagina recarrega os dados e perde o que estava sendo preenchido.

**Causa**: O React Query (gerenciador de dados) esta configurado sem opcoes customizadas, usando o comportamento padrao que recarrega automaticamente os dados quando a janela ganha foco.

**Solucao**: Desativar o `refetchOnWindowFocus` no `QueryClient` em `src/App.tsx`. Isso impede que os dados sejam buscados novamente toda vez que o usuario voltar para a aba.

```text
Arquivo: src/App.tsx
Antes:  const queryClient = new QueryClient();
Depois: const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
              staleTime: 5 * 60 * 1000, // 5 minutos
            }
          }
        });
```

---

## 2. Card de Produto responsivo no mobile

**Problema**: No celular, o card de produto nao se adapta bem e o nome da categoria fica cortado.

**Solucao**: Ajustar o `ProductCard.tsx`:
- Aumentar o `max-w` do badge da categoria de `100px` para `150px` (ou remover o limite para usar o espaco disponivel)
- Reorganizar o layout do header do card para empilhar os botoes de acao abaixo do titulo em telas pequenas
- Usar `flex-wrap` nos botoes de acao para que nao comprimam o conteudo
- Garantir que o bloco de custos use `text-base` ao inves de `text-lg` em mobile

Arquivo: `src/components/products/ProductCard.tsx`

---

## 3. Revisar Dicas do Dashboard

**Dicas atuais**:
1. Comece cadastrando seus ingredientes com precos atualizados
2. Crie receitas usando os ingredientes para calcular custos
3. Monte produtos combinando receitas, decoracoes e embalagens
4. Defina a margem de lucro para obter o preco de venda sugerido

**Analise**: A ordem esta correta e condiz com o fluxo do sistema. Porem, falta mencionar o passo de configurar custos operacionais (que e importante para calculos precisos).

**Dicas revisadas**:
1. Configure seus **custos operacionais** nas Configuracoes (forno, energia, mao de obra)
2. Cadastre seus **ingredientes** com precos atualizados
3. Crie **receitas** usando os ingredientes para calcular custos automaticamente
4. Cadastre **decoracoes** e **embalagens** que voce utiliza
5. Monte **produtos** combinando receitas, decoracoes e embalagens com sua margem de lucro

Arquivo: `src/components/dashboard/DashboardHome.tsx`

---

## 4. Revisar Acoes Rapidas

**Acoes atuais**: Novo Produto, Nova Receita, Novo Ingrediente

**Analise**: Faltam atalhos para Decoracoes e Embalagens, que sao igualmente usados com frequencia. Tambem falta um atalho para as Configuracoes de custo.

**Acoes revisadas**: Adicionar "Nova Decoracao", "Nova Embalagem" e "Configurar Custos"

Arquivo: `src/components/dashboard/DashboardHome.tsx`

---

## 5. Dashboard - informacoes adequadas

**Analise**: O dashboard ja possui:
- Cards de resumo (quantidades de cada modulo)
- Acoes rapidas
- Alertas de estoque
- Card de configuracao de custos (progresso)
- Card de assinatura
- Dicas

**Avaliacao**: Para o momento esta bem completo. Nao ha necessidade de adicionar mais informacoes agora.

---

## 6. Sessao de Assinatura

**Analise do card atual**: Esta funcional e mostra status, data de expiracao, botao para assinar/gerenciar, e opcao de verificar pagamento via boleto.

**Melhorias propostas**:
- Adicionar lista resumida dos beneficios do plano Premium dentro do card (para trial e expirado)
- Melhorar o texto informativo sobre o que o plano inclui

Arquivo: `src/components/subscription/SubscriptionCard.tsx`

---

## 7. Modulo de Suporte - Limitar a 1 ticket aberto por tipo

**Problema**: O usuario pode abrir multiplos tickets de suporte e sugestoes sem limite.

**Solucao**:
- No `SupportPage.tsx`, verificar se ja existe um ticket de suporte **aberto** ou **em andamento** antes de mostrar o botao "Novo Ticket"
- Se ja existir, desabilitar o botao e mostrar uma mensagem: "Voce ja tem um ticket aberto. Aguarde a resolucao antes de abrir outro."
- Mesma logica para sugestoes
- A verificacao e feita no frontend usando os dados ja carregados (`supportTickets` e `suggestions` filtrados por status)

Arquivo: `src/components/support/SupportPage.tsx`

---

## 8. Nova sessao: Atualizacoes e Melhorias do Sistema

**Descricao**: Criar uma sessao onde os usuarios possam ver as ultimas novidades, atualizacoes e melhorias do sistema. No admin, criar uma interface para gerenciar esses comunicados.

### Banco de Dados
Nova tabela `system_updates`:
- `id` (uuid, PK)
- `title` (text) - titulo da atualizacao
- `content` (text) - descricao detalhada (markdown simples)
- `type` (text) - "feature", "improvement", "fix"
- `published_at` (timestamptz) - data de publicacao
- `created_by` (uuid) - admin que criou
- `created_at` (timestamptz)
- `is_published` (boolean) - controle de visibilidade

RLS: Admins podem CRUD; usuarios autenticados podem apenas ler registros publicados.

### Frontend - Usuario
- Novo item no menu lateral: "Novidades" (icone Megaphone/Newspaper)
- Pagina listando as atualizacoes em ordem cronologica inversa
- Cards com icone por tipo (feature = estrela, improvement = seta pra cima, fix = ferramenta)
- Badge "Novo" para atualizacoes dos ultimos 7 dias
- Badge de notificacao no menu indicando atualizacoes nao vistas

Nova tabela `user_update_views` para rastrear quais atualizacoes cada usuario ja viu:
- `user_id` (uuid)
- `last_seen_at` (timestamptz)
- Unique constraint em `user_id`

### Frontend - Admin
- Nova aba "Novidades" no painel administrativo
- Formulario para criar/editar atualizacoes (titulo, conteudo, tipo, publicado/rascunho)
- Lista de atualizacoes com opcoes de editar, excluir e alternar publicacao

### Arquivos envolvidos:
- Migracao SQL para tabelas `system_updates` e `user_update_views`
- `src/hooks/useSystemUpdates.tsx` (novo hook)
- `src/components/updates/UpdatesPage.tsx` (pagina do usuario)
- `src/components/updates/UpdateCard.tsx` (card de atualizacao)
- `src/components/admin/UpdatesManagement.tsx` (gestao admin)
- `src/components/admin/UpdateForm.tsx` (formulario admin)
- `src/components/layout/AppLayout.tsx` (novo item no menu)
- `src/components/layout/AdminLayout.tsx` (nova aba)
- `src/pages/Dashboard.tsx` (adicionar rota)
- `src/pages/AdminDashboard.tsx` (adicionar aba)

---

## Resumo de Alteracoes por Arquivo

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Desativar refetchOnWindowFocus no QueryClient |
| `src/components/products/ProductCard.tsx` | Melhorar responsividade mobile e badge de categoria |
| `src/components/dashboard/DashboardHome.tsx` | Revisar dicas e adicionar acoes rapidas |
| `src/components/subscription/SubscriptionCard.tsx` | Adicionar beneficios do plano |
| `src/components/support/SupportPage.tsx` | Limitar 1 ticket aberto por tipo |
| Nova migracao SQL | Tabelas system_updates e user_update_views |
| `src/hooks/useSystemUpdates.tsx` | Novo hook para atualizacoes |
| `src/components/updates/UpdatesPage.tsx` | Nova pagina de novidades |
| `src/components/updates/UpdateCard.tsx` | Card de atualizacao |
| `src/components/admin/UpdatesManagement.tsx` | Gestao de novidades (admin) |
| `src/components/admin/UpdateForm.tsx` | Formulario de novidade (admin) |
| `src/components/layout/AppLayout.tsx` | Novo item "Novidades" no menu + badge |
| `src/components/layout/AdminLayout.tsx` | Nova aba "Novidades" |
| `src/pages/Dashboard.tsx` | Registrar pagina de novidades |
| `src/pages/AdminDashboard.tsx` | Registrar aba de novidades |
