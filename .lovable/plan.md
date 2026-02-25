

## Otimizacao SEO Completa do PreciBake

Melhorar o posicionamento no Google com as melhores praticas de SEO on-page, corrigir problemas identificados e adicionar elementos que faltam.

---

### 1. Resolver o problema do Google Search Console

Adicionar a meta tag de verificacao do Google no `index.html`. Voce precisara fornecer o codigo de verificacao que o Search Console te deu (formato: `google-site-verification` content).

**Arquivo:** `index.html`

---

### 2. Adicionar hreflang e melhorar meta tags

**Arquivo:** `index.html`

- Adicionar `<link rel="alternate" hreflang="pt-BR" href="https://precibake.com.br/" />`
- Remover `<meta name="keywords">` (Google ignora desde 2009, nao ajuda em nada)
- Adicionar `<meta name="robots" content="index, follow" />`
- Melhorar o og:image para uma imagem propria do PreciBake (atualmente usa placeholder do Lovable)

---

### 3. Melhorar alt texts das imagens

**Arquivo:** `ScreenshotsSection.tsx`

Atualizar os alt texts das 5 imagens para incluir palavras-chave relevantes:
- "Dashboard do PreciBake - sistema de gestao para confeitaria"
- "Calculo de custo de produto - precificacao automatica para bolos"
- "Calendario de pedidos - controle de encomendas de confeitaria"
- "Controle financeiro - fluxo de caixa para confeiteiras"
- "Orcamento via WhatsApp - envio de preco para clientes"

---

### 4. Adicionar semantica HTML nas secoes

**Arquivos:** Componentes da landing page

Garantir que cada secao tenha:
- Tags `<h2>` para titulos de secao (ja tem na maioria)
- Tags `<h3>` para subtitulos
- Atributos `aria-label` nas secoes principais
- IDs nas secoes para navegacao por ancora (`id="funcionalidades"`, `id="precos"`, etc.)

---

### 5. Expandir o sitemap

**Arquivo:** `public/sitemap.xml`

Adicionar URLs com ancora para secoes importantes:
- `https://precibake.com.br/#funcionalidades`
- `https://precibake.com.br/#precos`
- `https://precibake.com.br/#faq`
- Adicionar `<lastmod>` com a data atual

---

### 6. Adicionar palavras-chave faltantes no conteudo

Oportunidades de long-tail keywords para incluir naturalmente no texto das secoes:

- "como precificar doces para vender"
- "tabela de precos confeitaria"
- "app para confeiteira"
- "sistema de pedidos confeitaria"
- "como calcular lucro na confeitaria"

Essas seriam inseridas nos textos das secoes existentes (HeroSection, BenefitsSection, FAQSection) de forma natural, sem keyword stuffing.

---

### Resumo das mudancas por arquivo

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Meta tag verificacao Google, hreflang, remover keywords, robots, og:image |
| `public/sitemap.xml` | Adicionar URLs com ancora e lastmod |
| `ScreenshotsSection.tsx` | Alt texts otimizados com palavras-chave |
| Secoes da landing page | IDs para ancora, aria-labels, keywords naturais no texto |

---

### Sobre o erro 403 do Search Console

Esse erro NAO e do codigo. Voce precisa:
1. Acessar o Google Search Console pelo computador (nao pelo celular)
2. Verificar a propriedade do dominio via registro DNS (TXT record) ou via meta tag HTML
3. Apos a verificacao, o envio do sitemap deve funcionar

Eu adicionarei o espaco para a meta tag de verificacao, mas voce precisara me informar o codigo que o Google fornece.

