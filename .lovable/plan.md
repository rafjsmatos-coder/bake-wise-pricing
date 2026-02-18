

## FAQ Inteligente dentro do Suporte

### Conceito

Adicionar uma aba "FAQ" na pagina de suporte, com perguntas organizadas por categoria e busca instantanea. Alem disso, ao clicar em "Novo Ticket", o usuario vera sugestoes de FAQ relevantes antes de enviar -- incentivando a resolucao autonoma.

### Como funciona

```text
Pagina de Suporte (3 abas agora):

┌──────────────────────────────────────────────┐
│  [FAQ]  [Meus Tickets]  [Minhas Sugestoes]   │
├──────────────────────────────────────────────┤
│  🔍 Buscar duvida...                         │
│                                              │
│  📦 Cadastros e Receitas                     │
│  ├─ Como cadastro um ingrediente?            │
│  ├─ Como funciona a conversao de unidades?   │
│  └─ Posso usar receitas dentro de receitas?  │
│                                              │
│  💰 Precificacao                             │
│  ├─ Como o custo e calculado?                │
│  └─ O que e margem de seguranca?             │
│                                              │
│  📋 Pedidos e Estoque                        │
│  ├─ Como funciona a deducao de estoque?      │
│  └─ Posso gerar lista de compras?            │
│                                              │
│  💳 Assinatura e Pagamento                   │
│  ├─ Posso cancelar quando quiser?            │
│  └─ Como altero meu plano?                   │
│                                              │
│  ──────────────────────────────────────────  │
│  Nao encontrou sua resposta?                 │
│  [Abrir Ticket de Suporte]                   │
└──────────────────────────────────────────────┘
```

### Interceptacao antes do ticket

Quando o usuario clica em "Novo Ticket", antes de ir direto para o formulario, mostramos uma tela intermediaria:

```text
┌──────────────────────────────────────────────┐
│  Antes de abrir um ticket, veja se           │
│  sua duvida ja foi respondida:               │
│                                              │
│  🔍 Descreva seu problema...                 │
│                                              │
│  Sugestoes:                                  │
│  ├─ Como funciona a conversao de unidades?   │
│  ├─ O estoque esta mostrando valor errado?   │
│  └─ Como cadastro ingredientes?              │
│                                              │
│  [Minha duvida nao esta aqui → Abrir Ticket] │
└──────────────────────────────────────────────┘
```

Isso reduz tickets porque o usuario encontra a resposta antes de escrever.

### Gerenciamento pelo Admin

No painel admin, adicionar uma aba "FAQ" dentro do SupportManagement para o admin poder criar, editar, reordenar e publicar/despublicar perguntas sem depender de atualizacoes de codigo.

```text
Admin > Suporte (4 abas agora):

[Tickets]  [Sugestoes]  [FAQ]

FAQ:
┌─────────────────────────────────────────────┐
│  [+ Nova Pergunta]                          │
│                                             │
│  Categoria: Cadastros e Receitas            │
│  ┌─────────────────────────────────────────┐│
│  │ Como cadastro um ingrediente?     [✏️][🗑]│
│  │ Status: Publicado                       ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Categoria: Precificacao                    │
│  ┌─────────────────────────────────────────┐│
│  │ Como o custo e calculado?         [✏️][🗑]│
│  │ Status: Publicado                       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Alteracoes necessarias

#### Banco de dados (2 tabelas novas)

| Tabela | Colunas | Descricao |
|--------|---------|-----------|
| `faq_categories` | `id`, `name`, `icon`, `display_order`, `created_at` | Categorias do FAQ (ex: "Cadastros", "Precificacao") |
| `faq_items` | `id`, `category_id`, `question`, `answer`, `is_published`, `display_order`, `created_at`, `updated_at` | Perguntas e respostas |

RLS: leitura publica para usuarios autenticados, escrita somente para admins.

#### Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useFAQ.tsx` | Hook para buscar categorias e itens do FAQ, com filtro de busca local |
| `src/components/support/FAQTab.tsx` | Componente da aba FAQ com busca, categorias em accordion e link para abrir ticket |
| `src/components/support/FAQInterceptor.tsx` | Tela intermediaria antes do formulario de ticket, com busca fuzzy nas FAQs |
| `src/components/admin/FAQManagement.tsx` | CRUD de categorias e perguntas para o admin |
| `src/components/admin/FAQItemForm.tsx` | Formulario de criacao/edicao de pergunta FAQ |
| `src/components/admin/FAQCategoryForm.tsx` | Formulario de criacao/edicao de categoria FAQ |

#### Arquivos editados

| Arquivo | O que muda |
|---------|-----------|
| `src/components/support/SupportPage.tsx` | Adicionar aba "FAQ" como a primeira (default), importar `FAQTab`. Ao clicar "Novo Ticket", mostrar `FAQInterceptor` antes do `TicketForm` |
| `src/components/admin/SupportManagement.tsx` | Adicionar aba "FAQ" com o componente `FAQManagement` |
| `src/pages/AdminDashboard.tsx` | Sem alteracao (SupportManagement ja e renderizado la) |

### Detalhes tecnicos

**useFAQ hook:**
- Busca `faq_categories` ordenados por `display_order`
- Busca `faq_items` onde `is_published = true`, ordenados por `display_order`
- Filtro de busca local: compara o texto digitado com `question` e `answer` (case-insensitive, sem acentos)
- Para o admin: busca todos os itens (publicados ou nao)

**FAQTab:**
- Campo de busca no topo
- Categorias em Accordion (usando o componente ja existente)
- Cada categoria mostra suas perguntas como sub-accordions
- Se a busca tem texto, filtra e mostra apenas os matches (sem agrupamento por categoria)
- Rodape com "Nao encontrou? Abrir ticket" que muda para a aba de tickets

**FAQInterceptor:**
- Aparece quando `showTicketForm = true` (antes de ir para o TicketForm)
- Campo de busca que filtra as FAQs em tempo real
- Lista de perguntas relevantes com accordion para ver a resposta
- Botao "Minha duvida nao esta aqui" que leva ao TicketForm de verdade
- Se nao houver FAQs cadastrados, pula direto para o TicketForm

**FAQManagement (admin):**
- Lista de categorias com suas perguntas
- Botao para criar categoria e para criar pergunta dentro de cada categoria
- Toggle de publicado/nao publicado
- Edicao inline ou modal
- Reordenacao por drag (simplificado: botoes sobe/desce)

### Conteudo inicial sugerido

As perguntas serao criadas pelo admin apos a implementacao. No entanto, o sistema pode comecar com as categorias pre-cadastradas via migration:

1. **Primeiros Passos** - Cadastro, tour, navegacao
2. **Ingredientes e Receitas** - Como cadastrar, unidades, custos
3. **Produtos e Precificacao** - Margem, custos indiretos
4. **Pedidos e Estoque** - Lista de compras, deducao
5. **Financeiro** - Transacoes, relatorios
6. **Assinatura e Conta** - Pagamento, cancelamento, perfil

