
## Otimizacoes de SEO para o PreciBake

### O que sera corrigido

**1. Idioma da pagina (html lang)**
- Alterar `<html lang="en">` para `<html lang="pt-BR">` no `index.html`

**2. Link canonico**
- Alterar de `https://bake-wise-pricing.lovable.app/` para `https://precibake.com.br/`
- Atualizar tambem as URLs em `og:url`

**3. Titulo da pagina (muito curto)**
- Atual (38 caracteres): "PreciBake - Gestao Completa para Confeitaria"
- Novo (55+ caracteres): "PreciBake - Sistema de Gestao e Precificacao para Confeitaria"
- Inclui palavras-chave importantes: "sistema", "precificacao", "confeitaria"

**4. Meta descricao (muito longa, precisa ter 120-160 caracteres)**
- Atual (174 caracteres): "PreciBake — Sistema completo para confeiteiros: precificacao automatica, gestao de pedidos, controle financeiro, lista de compras e orcamento via WhatsApp. Use no celular como app."
- Nova (~155 caracteres): "PreciBake: sistema de precificacao e gestao para confeiteiros. Calcule precos, gerencie pedidos, controle financas e envie orcamentos via WhatsApp."

**5. Distribuicao de palavras-chave nas tags HTML**
- Adicionar palavras-chave principais no titulo e na descricao de forma mais estrategica
- Garantir que as tags `og:title` e `og:description` tambem reflitam as palavras-chave

**6. Rede social - Instagram**
- Remover `twitter:site` com "@PreciBake" (nao existe Twitter)
- Adicionar link do Instagram no Footer: `https://instagram.com/precibake`

**7. Criar sitemap.xml**
- Criar arquivo `public/sitemap.xml` com as paginas publicas do site
- Atualizar `robots.txt` para referenciar o sitemap

**8. Criar llms.txt**
- Criar `public/llms.txt` com descricao do PreciBake para LLMs

**9. Melhorar robots.txt**
- Adicionar referencia ao sitemap
- Formato mais limpo

**10. Dados estruturados (JSON-LD)**
- Atualizar URL do site para `precibake.com.br`
- Adicionar `sameAs` com link do Instagram

### Detalhes tecnicos

**Arquivos a editar:**
- `index.html` - lang, title, meta description, canonical, og tags, twitter tags, JSON-LD
- `public/robots.txt` - adicionar referencia ao sitemap
- `src/components/landing/Footer.tsx` - adicionar link do Instagram

**Arquivos a criar:**
- `public/sitemap.xml` - mapa do site com paginas publicas
- `public/llms.txt` - descricao do sistema para LLMs

### Sobre velocidade de carregamento
A velocidade de carregamento depende de fatores como tamanho das imagens e quantidade de JavaScript. A criacao do sitemap e as melhorias de meta tags ajudam no SEO, mas para melhorias significativas de velocidade seria necessario analisar o bundle e otimizar imagens — isso pode ser feito em uma etapa futura.
