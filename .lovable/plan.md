

## Otimizacao da Landing Page: SEO, Conversao e Posicionamento

Analise completa da pagina atual com todas as melhorias propostas.

---

### 1. SEO - Termos estrategicos para busca no Google

**Problema atual:** Os textos sao institucionais ("Gestao completa para sua confeitaria"). O Google nao encontra a pagina quando alguem pesquisa "como calcular preco de bolo" ou "sistema para confeiteiras".

**Mudancas:**

| Onde | Atual | Novo |
|------|-------|------|
| `<title>` (index.html) | "PreciBake - Sistema de Gestao e Precificacao para Confeitaria" | "PreciBake - Calculadora de Preco para Confeitaria \| Sistema para Confeiteiras" |
| `<meta description>` | Texto generico | "Calcule o preco certo dos seus bolos, doces e sobremesas. Sistema completo para confeiteiras que vendem sob encomenda. Teste gratis por 7 dias." |
| `<meta keywords>` | Poucos termos | Adicionar: "como calcular preco de bolo, calculadora confeitaria, precificacao para doces, sistema para confeiteiras, planilha confeitaria, quanto cobrar por bolo, preco de brigadeiro" |
| H1 (HeroSection) | "Gestao completa para sua confeitaria" | "Calcule o preco certo dos seus bolos e doces - pare de vender barato" |
| H2 (PainPoints) | Sem H2 visivel | Adicionar: "Voce ainda precifica no olho?" |
| H2 (Features) | "Tudo que voce precisa para gerenciar" | "Sistema completo de precificacao e gestao para confeiteiras" |

**Adicionar FAQ com perguntas que as pessoas pesquisam no Google:**
- "Como calcular o preco de um bolo caseiro?"
- "Quanto cobrar por 100 brigadeiros?"
- "Como incluir mao de obra no preco do bolo?"

Essas perguntas tem volume de busca real e o Google mostra FAQs nos resultados.

**Schema.org (JSON-LD):** Adicionar `FAQPage` schema para que as perguntas aparecam diretamente nos resultados do Google.

---

### 2. Posicionamento: Foco em confeiteiras caseiras sob encomenda

**Concordo com sua analise.** O publico "Cake Designer" e "Confeiteira" sao perfis diferentes. Quem mais precisa do sistema e a **confeiteira caseira que vende sob encomenda e nao sabe quanto cobrar**.

**Mudancas no TargetAudienceSection:**

Trocar os badges genericos por um texto direto:

> "Para confeiteiras e doceiras que vendem sob encomenda e querem parar de vender barato"

Abaixo, badges mais especificos:
- "Bolos sob encomenda"
- "Doces para festas"
- "Sobremesas artesanais"
- "Confeitaria caseira"

**Mudanca no subtitulo do Hero:**

> "Para confeiteiras que vendem sob encomenda e precisam saber exatamente quanto cobrar"

---

### 3. Bloco comparativo: Planilha vs PreciBake

Nova secao `ComparisonSection` posicionada logo apos o BenefitsSection.

Layout em duas colunas:

| Planilha / Calculando na mao | PreciBake |
|------|-----------|
| Esquece de incluir gas e energia | Calcula tudo automaticamente |
| Demora para montar orcamento | Orcamento pronto em 1 clique |
| Nao controla pedidos | Calendario com status de cada pedido |
| Sem controle financeiro | Fluxo de caixa e relatorios |
| Perde tempo atualizando precos | Precos atualizados em tempo real |
| Nao sabe o lucro real | Lucro estimado por produto |

Coluna da esquerda com X vermelho, coluna da direita com check verde. Visual impactante.

---

### 4. Gatilho de urgencia no plano (Preco Promocional de Lancamento)

**Mudancas no PricingSection:**

- Badge superior: "PRECO DE LANCAMENTO" (em vez de "7 DIAS GRATIS")
- Adicionar preco riscado ficticio: ~~R$ 79,90~~ **R$ 49,90/mes**
- Texto abaixo: "Preco promocional por tempo limitado. Quem assinar agora garante esse valor para sempre."
- Manter o "7 dias gratis para testar" como bullet point
- Adicionar contador visual: "Vagas limitadas no preco de lancamento"

---

### 5. Prova social: Preparar para depoimentos reais

**Agora (lancamento):** Manter os depoimentos atuais, mas adicionar uma label sutil indicando que sao exemplos de resultados esperados. Isso e mais honesto e nao prejudica a conversao.

**Estrutura preparada para o futuro:** Cada depoimento tera campos para:
- Foto do cliente (avatar)
- Nome e cidade
- Link do Instagram
- Resultado com numero real

**Sistema de avaliacao interno (futuro):** Voce mencionou captar avaliacoes dos proprios usuarios. Isso e 100% valido e nao e abusivo desde que seja voluntario. A ideia seria: apos 30 dias de uso ativo, mostrar um modal pedindo avaliacao com estrelas + depoimento + permissao para usar na pagina. Isso pode ser implementado depois.

---

### 6. Secao de prints do sistema (Screenshots)

Nova secao `ScreenshotsSection` posicionada entre FeaturesSection e PricingSection.

**Onde tirar os prints (sugestao de telas):**

1. **Dashboard principal** - Mostra a visao geral com os cards de resumo
2. **Tela de produto com breakdown de custos** - A tela mais importante: custo total, preco sugerido, lucro
3. **Calendario de pedidos** - Mostra organizacao visual
4. **Orcamento via WhatsApp** - Print do celular mostrando o orcamento formatado
5. **Controle financeiro** - Graficos e fluxo de caixa

**Layout:** Carrossel horizontal com 3-5 imagens, com legenda curta embaixo de cada uma. No mobile, desliza horizontalmente.

**Dica para os prints:** Use o modo escuro (que acabamos de implementar) para prints com fundo escuro - fica mais profissional e moderno em landing pages.

---

### 7. Secao de video demonstrativo

Nova secao `VideoSection` posicionada logo apos o HeroSection (ou apos PainPoints).

**Estrutura:** Thumbnail clicavel com botao play. Ao clicar, abre o video em um modal ou embed do YouTube/Vimeo.

**Roteiro sugerido para o video de 60 segundos:**

| Tempo | Conteudo |
|-------|----------|
| 0-5s | "Voce sabe quanto realmente lucra com cada bolo?" (texto na tela + voz) |
| 5-15s | Mostrar o problema: planilha confusa, calculo de cabeca |
| 15-25s | Mostrar o cadastro de ingredientes e receita no PreciBake |
| 25-35s | Mostrar o produto com breakdown: custo, preco, lucro |
| 35-45s | Mostrar orcamento sendo enviado pelo WhatsApp |
| 45-55s | Mostrar dashboard com pedidos e financeiro |
| 55-60s | CTA: "Teste gratis por 7 dias. PreciBake.com.br" |

**Dica:** Grave a tela do celular usando o sistema real. Pode usar gravacao de tela do iPhone/Android. Nao precisa aparecer o rosto - foco 100% no sistema.

---

### 8. Corrigir inconsistencia no FAQ

**Problema:** O FAQ diz "14 dias para testar" mas o sistema oferece 7 dias. Precisa corrigir para 7 dias.

---

### 9. Ordem final das secoes (otimizada para conversao)

```text
1. StickyHeader (CTA fixo)
2. HeroSection (headline SEO + CTA)
3. TargetAudienceSection (posicionamento focado)
4. PainPointsSection (dor)
5. BenefitsSection (promessa de resultado)
6. VideoSection (NOVA - video demonstrativo)
7. ExampleSection (numeros reais)
8. ComparisonSection (NOVA - Planilha vs PreciBake)
9. ScreenshotsSection (NOVA - prints do sistema)
10. FeaturesSection (funcionalidades)
11. PricingSection (preco de lancamento + urgencia)
12. TestimonialsSection (prova social)
13. FAQSection (SEO + objecoes)
14. CTASection (CTA final)
15. Footer
```

---

### Resumo tecnico das mudancas

| Arquivo | Tipo | O que muda |
|---------|------|-----------|
| `index.html` | Editar | Title, meta description, meta keywords, adicionar FAQPage schema |
| `HeroSection.tsx` | Editar | H1 com termos SEO, subtitulo focado |
| `TargetAudienceSection.tsx` | Editar | Posicionamento focado em confeiteiras caseiras sob encomenda |
| `PainPointsSection.tsx` | Editar | Adicionar H2 com pergunta de busca |
| `FeaturesSection.tsx` | Editar | H2 com termos SEO |
| `PricingSection.tsx` | Editar | Preco de lancamento, preco riscado, urgencia |
| `TestimonialsSection.tsx` | Editar | Adicionar label "resultados esperados", preparar campos para foto/cidade/instagram |
| `FAQSection.tsx` | Editar | Corrigir 14->7 dias, adicionar perguntas SEO |
| `ComparisonSection.tsx` | **Novo** | Planilha vs PreciBake |
| `ScreenshotsSection.tsx` | **Novo** | Carrossel de prints (placeholder ate voce enviar os prints) |
| `VideoSection.tsx` | **Novo** | Embed de video (placeholder ate voce enviar o video) |
| `LandingPage.tsx` | Editar | Nova ordem das secoes |
| `public/sitemap.xml` | Editar | Manter atualizado |

**Proximo passo de voce:** Me envie os prints das telas do sistema e o video quando estiverem prontos. Posso implementar tudo o restante agora e deixar placeholders para os prints e video.

