

# Sistema de Suporte e Sugestoes - PreciBake

## Objetivo
Implementar um sistema completo onde usuarios podem:
1. **Abrir tickets de suporte** para resolver problemas
2. **Enviar sugestoes** para melhorar o sistema

Administradores visualizam e gerenciam tudo pelo painel admin.

---

## 1. Estrutura do Banco de Dados

### 1.1 Tabela support_tickets

Campos principais:
- `id`: Identificador unico (UUID)
- `user_id`: ID do usuario que criou
- `type`: Tipo do registro - 'support' ou 'suggestion'
- `subject`: Assunto curto
- `message`: Descricao detalhada
- `status`: open, in_progress, resolved, closed
- `priority`: low, normal, high, urgent (para suporte)
- `created_at`, `updated_at`: Timestamps

### 1.2 Tabela support_replies

Campos principais:
- `id`: Identificador unico
- `ticket_id`: Referencia ao ticket
- `user_id`: Quem enviou a resposta
- `message`: Conteudo da resposta
- `is_admin_reply`: Se foi resposta do admin
- `created_at`: Timestamp

### 1.3 Politicas de Seguranca (RLS)

**Para usuarios:**
- Podem criar tickets/sugestoes proprios
- Podem visualizar apenas seus proprios registros
- Podem responder aos seus proprios tickets

**Para admins:**
- Podem visualizar todos os registros
- Podem atualizar status e prioridade
- Podem responder qualquer ticket

---

## 2. Interface do Usuario

### 2.1 Botao no Menu Lateral

Novo item "Suporte" no menu principal com icone de headphones/lifeBuoy.

### 2.2 Pagina de Suporte

**Duas abas:**
- **Meus Tickets**: Lista de tickets de suporte do usuario
- **Minhas Sugestoes**: Lista de sugestoes enviadas

**Acoes disponiveis:**
- "Novo Ticket" - Abre formulario de suporte
- "Nova Sugestao" - Abre formulario de sugestao

### 2.3 Formulario de Ticket de Suporte

Campos:
- Assunto (obrigatorio)
- Descricao do problema (obrigatorio, minimo 20 caracteres)

### 2.4 Formulario de Sugestao

Campos:
- Titulo da sugestao (obrigatorio)
- Descricao detalhada (obrigatorio, minimo 20 caracteres)

### 2.5 Visualizacao de Detalhes

- Status atual (badge colorido)
- Historico de mensagens (estilo chat)
- Campo para enviar nova mensagem

---

## 3. Interface do Administrador

### 3.1 Nova Aba no Painel Admin

Adicionar aba "Suporte" com:
- Sub-aba: Tickets de Suporte
- Sub-aba: Sugestoes

### 3.2 Lista de Tickets/Sugestoes

Colunas da tabela:
- Usuario (nome/email)
- Tipo (Suporte/Sugestao)
- Assunto
- Status (badge colorido)
- Prioridade (apenas para suporte)
- Data
- Acoes

**Filtros disponiveis:**
- Por tipo (suporte/sugestao)
- Por status
- Por prioridade
- Busca por texto

### 3.3 Modal de Gerenciamento

Ao clicar em um ticket:
- Ver informacoes do usuario
- Ver mensagem original
- Alterar status
- Alterar prioridade (suporte)
- Historico de respostas
- Campo para responder

---

## 4. Badges e Cores

### Status
- Aberto: Amarelo
- Em Andamento: Azul
- Resolvido: Verde
- Fechado: Cinza

### Prioridade (Suporte)
- Baixa: Cinza
- Normal: Azul
- Alta: Laranja
- Urgente: Vermelho

### Tipo
- Suporte: Azul com icone de headphones
- Sugestao: Verde com icone de lampada

---

## 5. Arquivos a Serem Criados

### Componentes do Usuario
- `src/components/support/SupportPage.tsx` - Pagina principal
- `src/components/support/TicketForm.tsx` - Formulario de ticket
- `src/components/support/SuggestionForm.tsx` - Formulario de sugestao
- `src/components/support/TicketList.tsx` - Lista de tickets
- `src/components/support/TicketDetails.tsx` - Detalhes e chat

### Componentes do Admin
- `src/components/admin/SupportManagement.tsx` - Gerenciamento completo
- `src/components/admin/AdminTicketModal.tsx` - Modal de resposta

### Hooks
- `src/hooks/useSupport.tsx` - Logica de dados

### Atualizacoes
- `src/components/layout/AppLayout.tsx` - Adicionar menu
- `src/components/admin/AdminPanel.tsx` - Nova aba
- `src/pages/Dashboard.tsx` - Integrar navegacao

---

## 6. Fluxo do Usuario

```text
Usuario quer ajuda ou tem ideia
           |
           v
    Clica em "Suporte"
           |
           v
  Ve abas: Tickets | Sugestoes
           |
     +-----+-----+
     |           |
     v           v
 Ticket?    Sugestao?
     |           |
     v           v
Formulario  Formulario
de Suporte  de Sugestao
     |           |
     v           v
Preenche e envia dados
           |
           v
  Salvo no banco com status "open"
           |
           v
Usuario acompanha resposta do admin
```

---

## 7. Fluxo do Administrador

```text
Admin acessa painel
        |
        v
Clica na aba "Suporte"
        |
        v
Ve sub-abas: Tickets | Sugestoes
        |
        v
Filtra por status/prioridade
        |
        v
Clica em item para abrir modal
        |
        v
Le mensagem, altera status, responde
        |
        v
Usuario recebe notificacao visual
```

---

## 8. Ordem de Implementacao

1. **Migracao SQL**
   - Criar tabela support_tickets com campo type
   - Criar tabela support_replies
   - Configurar RLS para usuarios e admins

2. **Hook useSupport**
   - Funcoes: fetch, create, reply, updateStatus

3. **Componentes do Usuario**
   - SupportPage, TicketForm, SuggestionForm
   - TicketList, TicketDetails

4. **Integracao no Layout**
   - Menu lateral e navegacao

5. **Componentes do Admin**
   - SupportManagement, AdminTicketModal
   - Integrar no AdminPanel

---

## Resumo de Funcionalidades

| Funcionalidade | Usuario | Admin |
|----------------|---------|-------|
| Criar ticket de suporte | OK | - |
| Enviar sugestao | OK | - |
| Ver proprios registros | OK | - |
| Ver todos registros | - | OK |
| Responder | OK (proprio) | OK (todos) |
| Alterar status | - | OK |
| Alterar prioridade | - | OK |
| Filtrar e buscar | - | OK |

