

## Correcoes Anti-Spam nos E-mails de Autenticacao

### Problema identificado

Os e-mails de recuperacao de senha estao caindo em spam por varios motivos que podemos corrigir nos templates e na configuracao.

### Causas principais (baseadas nas boas praticas oficiais)

1. **Emoji no assunto e no corpo** - O emoji "cupcake" no header do e-mail e suspeito para filtros de spam
2. **Conteudo "marketing" nos e-mails transacionais** - Frases como "O ponto certo do preco" e descricoes do sistema no rodape sao interpretadas como marketing, nao como e-mail transacional
3. **Links extras alem do CTA principal** - O link do Instagram no rodape adiciona um link desnecessario. E-mails transacionais devem ter o minimo de links possivel
4. **Assunto com nome da marca repetido** - "PreciBake - Redefinir sua senha" pode ser simplificado

### O que sera corrigido

**1. Simplificar os templates (todos os 3)**
- Remover emoji do header
- Remover slogan "O ponto certo do preco" (conteudo marketing)
- Remover link do Instagram do rodape (reduzir links)
- Manter rodape minimo: apenas copyright e nome do sistema
- Texto mais direto e curto no corpo

**2. Simplificar os assuntos**
- Recovery: "Redefinir sua senha - PreciBake" (acao primeiro, marca depois)
- Confirmation: "Confirme seu e-mail - PreciBake"
- Email change: "Confirme a alteracao de e-mail - PreciBake"

**3. Adicionar texto alternativo (plain text fallback)**
- Adicionar versao texto puro do link abaixo do botao CTA para clientes de e-mail que bloqueiam HTML
- Formato: "Ou copie e cole este link no seu navegador: {{ .ConfirmationURL }}"

**4. Remover box-shadow e estilos complexos**
- Filtros de spam penalizam CSS complexo em e-mails transacionais
- Simplificar o visual mantendo a identidade

### Detalhes tecnicos

**Arquivos a editar:**
- `supabase/templates/recovery.html`
- `supabase/templates/confirmation.html`
- `supabase/templates/email_change.html`
- `supabase/config.toml` (ajustar subjects)

**Estrutura simplificada de cada template:**

```text
+----------------------------------+
| PreciBake (texto, sem emoji)     |
+----------------------------------+
| Titulo da acao                   |
| Texto curto e direto             |
|                                  |
| [  Botao CTA  ]                 |
|                                  |
| Link alternativo em texto        |
| Texto de seguranca (ignorar)     |
+----------------------------------+
| (c) 2025 PreciBake               |
+----------------------------------+
```

**Resumo das mudancas por template:**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Header | Emoji + slogan | Texto limpo "PreciBake" |
| Rodape | Copyright + descricao + Instagram | Apenas copyright |
| Links | CTA + Instagram | Apenas CTA + fallback texto |
| CSS | box-shadow, border-radius complexo | Estilos minimos |
| Subject | "PreciBake - Acao" | "Acao - PreciBake" |
| Fallback | Nenhum | Link em texto puro |

### Importante: o que NAO podemos corrigir aqui

- **SMTP personalizado**: Os e-mails sao enviados pelo servidor padrao do Lovable Cloud. Para maxima entregabilidade, o ideal e configurar um SMTP proprio (como Resend ou Mailgun) com registros SPF, DKIM e DMARC no dominio `precibake.com.br`. Isso e feito fora do Lovable.
- **Dominio de envio**: O remetente atual e generico. Quando voce tiver o e-mail `suporte@precibake.com.br`, podera configurar um servico de envio com esse dominio.

