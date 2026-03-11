

# Plano: Remover VideoSection + Analise de Prontidao para Divulgacao

## Parte 1 — Remocao da VideoSection

**Alteracao simples e isolada:**

- **`src/components/landing/LandingPage.tsx`**: Remover o import de `VideoSection` e remover `<VideoSection />` da renderizacao.
- **`src/components/landing/VideoSection.tsx`**: Pode ser deletado ou mantido para uso futuro. Recomendacao: manter o arquivo mas remover da landing page (zero risco).
- **Risco**: Zero. Nao altera nenhum outro componente.
- **Esforco**: 1 minuto.

---

## Parte 2 — Analise de Prontidao para Divulgacao

### 1. Veredito direto

**Pode divulgar agora.**

### 2. Motivo principal

O produto esta funcional, completo nas areas centrais (precificacao, pedidos, financeiro), com fluxo de cadastro/login operacional, paywall integrada via Stripe, trial de 7 dias configurado, landing page com proposta de valor clara, SEO estruturado, e suporte ao usuario embutido. Nao ha bloqueios criticos que impecam a captacao de usuarios.

### 3. Pontos fortes atuais para divulgacao

| Ponto forte | Observacao |
|---|---|
| **Proposta de valor clara** | Hero section com headline direta, badges de funcionalidades, e CTA visivel |
| **Fluxo de cadastro completo** | Signup com validacao de senha, confirmacao por e-mail, e trial de 7 dias |
| **Monetizacao funcional** | Stripe integrado com checkout, customer portal, promo de lancamento (35 vagas) |
| **PWA instalavel** | Funciona no celular como app nativo, com service worker e manifest |
| **Conteudo de conversao** | Screenshots reais, FAQ com SEO, secao antes/depois, depoimentos, comparacao |
| **Suporte embutido** | FAQ + tickets + sugestoes dentro do sistema |
| **Paginas legais** | Termos de uso e privacidade (LGPD) presentes e linkados no cadastro |
| **SEO tecnico** | Schema.org (SoftwareApplication + FAQPage), OG tags, sitemap, robots.txt |
| **Tour guiado** | Onboarding com reactour para novos usuarios |
| **Campanha promo ativa** | Mecanismo de vagas limitadas (35 slots) com contador funcional |

### 4. Riscos atuais para divulgacao

| Risco | Severidade | Detalhes |
|---|---|---|
| **VideoSection com placeholder** | Media | Secao "Video em breve" com play button que nao faz nada — passa imagem de incompleto. **Sera resolvido na Parte 1 deste plano.** |
| **Depoimentos ficticios** | Baixa | Os 3 depoimentos sao claramente simulados (nomes genericos, sem fotos). Ja tem disclaimer "*Resultados esperados...*" o que mitiga o risco. |
| **TrialBanner com preco fixo** | Baixa | O banner mostra "Assinar por R$ 49,90" mesmo quando a promo de R$ 29,90 esta ativa. Inconsistencia visual menor. |
| **Sem onboarding de dados iniciais** | Baixa | Usuario novo entra no sistema vazio. Nao ha dados de exemplo pre-carregados. Normal para este tipo de produto, mas pode gerar abandono se o usuario nao entender por onde comecar. O tour guiado mitiga isso. |

### 5. O que e critico corrigir ANTES de divulgar

| Item | Acao | Esforco |
|---|---|---|
| **Remover VideoSection** | Ja incluido neste plano | 1 min |

**Nenhum outro bloqueio critico identificado.** O sistema esta pronto para receber usuarios.

### 6. O que pode ficar para a fase pos-divulgacao

| Item | Prioridade |
|---|---|
| Substituir depoimentos simulados por reais (conforme usuarios reais surgirem) | Media |
| Corrigir TrialBanner para exibir preco promo quando ativa | Baixa |
| Adicionar video real quando disponivel (reativar VideoSection) | Baixa |
| Dados de exemplo pre-carregados para novos usuarios | Media |
| Melhorias de higiene tecnica (etapas 5+6 do plano anterior) | Baixa |
| Testes automatizados (Vitest) | Baixa |

### 7. Nota de prontidao

**8.5 / 10**

O produto esta acima do minimo viavel para divulgacao. Tem monetizacao funcional, UX coerente, SEO configurado, e fluxo completo de ponta a ponta. Os pontos pendentes sao cosmeticos ou de otimizacao, nenhum e bloqueante.

### 8. Recomendacao final

Remova a VideoSection agora (este plano), publique, e comece a divulgar. O sistema esta pronto. Concentre-se em gerar os primeiros usuarios reais e coletar feedback antes de investir em melhorias tecnicas adicionais.

