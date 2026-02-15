

## Integrar Resend para E-mails de Autenticacao em Portugues

### Resumo

Criar uma funcao backend que envia os e-mails de autenticacao (confirmacao, recuperacao de senha, troca de e-mail) usando o Resend, com os templates em portugues que ja temos prontos. Isso substitui o e-mail padrao em ingles do sistema.

### O que voce precisa fazer antes (fora do Lovable)

**1. Criar conta gratuita no Resend**
- Acesse https://resend.com e crie uma conta
- Plano gratuito: 3.000 e-mails/mes (mais que suficiente)

**2. Verificar o dominio precibake.com.br**
- No painel do Resend, va em "Domains" e adicione `precibake.com.br`
- O Resend vai gerar registros DNS (MX, TXT, CNAME)
- Adicione esses registros no painel DNS da Hostinger
- Aguarde a verificacao (geralmente alguns minutos)

**3. Criar uma API Key**
- No Resend, va em "API Keys" e crie uma chave
- Eu vou solicitar essa chave de forma segura no Lovable

### O que eu vou implementar

**1. Criar a funcao backend `send-auth-email`**

Nova edge function que:
- Recebe o tipo de e-mail (confirmation, recovery, email_change)
- Recebe o e-mail do destinatario e a URL de confirmacao
- Monta o HTML em portugues usando nossos templates existentes
- Envia via API do Resend com remetente `PreciBake <noreply@precibake.com.br>`

**2. Criar funcao backend `auth-email-hook`**

Hook de autenticacao que:
- Intercepta eventos de e-mail do sistema de auth
- Redireciona para nossa funcao de envio personalizada
- Garante que TODOS os e-mails saiam em portugues

**3. Configurar o hook no banco de dados**

Migracao SQL para registrar o hook que intercepta os e-mails de autenticacao e usa nossa funcao em vez do sistema padrao.

### Arquivos a criar/editar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/send-auth-email/index.ts` | Criar | Funcao que envia e-mail via Resend com templates PT-BR |
| `supabase/config.toml` | Editar | Adicionar configuracao do hook e desabilitar JWT para a nova funcao |
| Migracao SQL | Criar | Configurar hook de e-mail no sistema de autenticacao |

### Detalhes tecnicos

**Fluxo completo:**

```text
Usuario pede reset de senha
        |
        v
Sistema de Auth gera token + URL
        |
        v
Hook intercepta o envio de e-mail
        |
        v
Chama send-auth-email com dados
        |
        v
Funcao monta HTML em PT-BR
        |
        v
Resend envia com remetente
noreply@precibake.com.br
        |
        v
Usuario recebe e-mail bonito,
em portugues, fora do spam
```

**Estrutura da edge function `send-auth-email`:**
- Recebe payload do hook com: tipo do e-mail, endereco do destinatario, token/URL
- Seleciona o template correto (confirmation, recovery, email_change)
- Injeta a URL de confirmacao no template HTML
- Chama a API do Resend (POST https://api.resend.com/emails)
- Retorna sucesso ou erro

**Secret necessaria:**
- `RESEND_API_KEY` - Chave de API do Resend (sera solicitada de forma segura)

### Resultado final

- E-mails de confirmacao, recuperacao e troca de e-mail em portugues
- Remetente profissional: `PreciBake <noreply@precibake.com.br>`
- Melhor entregabilidade (dominio verificado com SPF/DKIM)
- Custo: R$ 0 (plano gratuito do Resend)
- Sem precisar contratar plano de e-mail separado

