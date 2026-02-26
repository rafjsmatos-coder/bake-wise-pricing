

# Auditoria Pre-Lancamento PreciBake

---

## P0 — Riscos Criticos (podem quebrar o lancamento)

### P0-1. `send-auth-email` usa CORS `Allow-Origin: *`
**Impacto:** A funcao de cadastro/recuperacao aceita requisicoes de qualquer dominio, diferente das outras funcoes que usam allowlist restrita. Um atacante pode criar um formulario em outro site e disparar cadastros ou recuperacoes de senha em nome do PreciBake.
**Correcao:** Migrar `send-auth-email` para usar o `_shared/cors.ts` com a mesma allowlist.

### P0-2. `send-auth-email` nao tem rate limiting
**Impacto:** Sem nenhum controle, um script pode fazer milhares de chamadas por minuto para criar contas ou disparar e-mails de recuperacao, gerando custos excessivos no Resend e potencial blacklist do dominio.
**Correcao:** Adicionar rate limiting basico usando uma tabela de throttle ou verificar timestamps no banco antes de enviar.

### P0-3. `verify-checkout` nao valida entrada do `session_id`
**Impacto:** O campo `session_id` vem direto do body JSON sem sanitizacao. Embora o Stripe rejeite IDs invalidos, nao ha validacao de formato (`cs_...`) antes da chamada.
**Correcao:** Validar que o `session_id` comeca com `cs_` e tem tamanho razoavel antes de consultar o Stripe.

### P0-4. Stripe boleto + subscription: incompatibilidade potencial
**Impacto:** O Stripe nao suporta boleto como metodo de pagamento recorrente em subscriptions de modo nativo em todos os cenarios. Se o usuario pagar o primeiro boleto mas nao pagar os seguintes, a assinatura fica em estado inconsistente. A logica de `check-subscription` nao trata o status `past_due` do Stripe.
**Correcao:** Adicionar tratamento para `past_due` e `incomplete` na verificacao de assinatura, e considerar se boleto em subscription e viavel para o modelo de negocio.

### P0-5. Leaked Password Protection desabilitada
**Impacto:** Usuarios podem criar contas com senhas ja vazadas em data breaches, aumentando risco de contas comprometidas.
**Correcao:** Ativar a protecao de senhas vazadas nas configuracoes de autenticacao.

### P0-6. Copyright "2025" nos templates de email
**Impacto:** Os templates HTML de email de confirmacao, recuperacao e alteracao mostram "© 2025 PreciBake" — deveria ser 2026 (data atual).
**Correcao:** Atualizar para ano correto ou usar ano dinamico.

---

## P1 — Melhorias Importantes (conversao/retencao)

### P1-1. Secao de video mostra "Video em breve"
**Impacto:** Secao vazia reduz credibilidade da landing page. Visitantes podem achar que o produto e inacabado.
**Correcao:** Quando o video estiver pronto, substituir o placeholder. Enquanto isso, considerar remover a secao temporariamente ou substituir por um passo-a-passo visual interativo.

### P1-2. Sem onboarding apos cadastro para estados vazios
**Impacto:** Apos confirmar email e fazer login, o usuario ve um dashboard vazio sem orientacao clara sobre o que fazer primeiro. Isso pode causar abandono no primeiro uso.
**Correcao:** O tour ja existe (`TourProvider`), mas garantir que ele inicia automaticamente no primeiro acesso e guia o usuario para cadastrar o primeiro ingrediente.

### P1-3. Sem webhook do Stripe para sincronizacao em tempo real
**Impacto:** O sistema depende de polling (1x por minuto) e fallback manual para detectar mudancas de assinatura. Cancelamentos feitos no Stripe podem demorar ate 1 minuto para refletir. Renovacoes automaticas dependem do fallback.
**Correcao:** Ja existe `STRIPE_WEBHOOK_SECRET` nos secrets. Implementar webhook para eventos `invoice.paid`, `customer.subscription.deleted`, `customer.subscription.updated` para sincronizacao instantanea.

### P1-4. `ForgotPasswordForm` nao usa `ThemeLogo`
**Impacto:** A tela de recuperacao de senha ainda importa `precibakeIcon` diretamente em vez de usar o componente `ThemeLogo`. No modo escuro, o icone nao se adapta.
**Correcao:** Substituir por `ThemeLogo` como feito nos demais formularios.

### P1-5. Sem metricas de ativacao/funil
**Impacto:** Nao ha como medir quantos usuarios completam o cadastro, criam o primeiro ingrediente, primeira receita ou primeiro pedido. Sem essas metricas, impossivel otimizar retencao.
**Correcao:** Adicionar eventos basicos (pode ser via tabela no banco ou servico externo como Google Analytics/Plausible).

### P1-6. Sem lazy loading nos componentes do Dashboard
**Impacto:** Todos os componentes de pagina (IngredientsList, RecipesList, OrdersList, etc.) sao importados estaticamente no `Dashboard.tsx`, aumentando o bundle inicial.
**Correcao:** Usar `React.lazy()` + `Suspense` para carregar componentes sob demanda.

---

## P2 — Nice to Have

### P2-1. Otimizacao de imagens da landing page
Os screenshots em `src/assets/screenshots/` sao JPEGs sem compressao otimizada. Converter para WebP com fallback JPEG reduziria o tempo de carregamento em 4G.

### P2-2. Adicionar `rel="noopener noreferrer"` em links externos
Garantir que todos os `<a target="_blank">` tenham estes atributos para seguranca.

### P2-3. Preload de fontes criticas
Adicionar `<link rel="preload">` para fontes usadas above-the-fold no `index.html`.

### P2-4. Remover `console.log` de producao
`SubscriptionSuccess.tsx` tem `console.log` de debug. Remover ou condicionar a ambiente de desenvolvimento.

### P2-5. Service Worker: adicionar `skipWaiting` + `clientsClaim`
O PWA usa `registerType: "autoUpdate"` que ja faz isso, mas confirmar que o prompt de atualizacao funciona corretamente para evitar cache stale.

### P2-6. Adicionar `<meta name="google-site-verification">` real
O `index.html` tem o placeholder comentado. Adicionar o codigo real do Google Search Console antes do lancamento.

---

## Checklist Final de Lancamento

### Seguranca
- [ ] Migrar CORS de `send-auth-email` para allowlist restrita
- [ ] Validar formato de `session_id` no `verify-checkout`
- [ ] Ativar leaked password protection na autenticacao
- [ ] Revisar tratamento de `past_due` no fluxo de assinatura
- [ ] Atualizar copyright nos templates de email para 2026

### Produto
- [ ] Confirmar que o tour de onboarding inicia no primeiro login
- [ ] Testar fluxo completo: cadastro → email → login → tour → primeiro ingrediente
- [ ] Testar checkout com cartao (modo teste)
- [ ] Testar checkout com boleto (modo teste)
- [ ] Testar cancelamento via portal do Stripe
- [ ] Testar recuperacao de senha (ponta a ponta)
- [ ] Verificar estados vazios em todas as paginas
- [ ] Corrigir `ForgotPasswordForm` para usar `ThemeLogo`
- [ ] Decidir se remove ou mantem secao de video

### SEO e Social
- [ ] Confirmar que `robots.txt` e `sitemap.xml` estao acessiveis em producao
- [ ] Testar OG preview compartilhando link no WhatsApp
- [ ] Adicionar `google-site-verification` real
- [ ] Verificar structured data no Google Rich Results Test

### Performance
- [ ] Implementar lazy loading nos componentes do Dashboard
- [ ] Otimizar screenshots para WebP
- [ ] Medir Lighthouse score da landing page (meta: >80 performance)

### Observabilidade
- [ ] Definir como capturar erros em producao (considerar Sentry ou logging estruturado)
- [ ] Planejar metricas de funil (cadastro → ativacao → conversao)

### Deploy
- [ ] Publicar frontend atualizado
- [ ] Verificar que edge functions estao deployadas
- [ ] Testar em dispositivo real (iPhone + Android)
- [ ] Confirmar PWA instalavel no celular
- [ ] Monitorar logs das edge functions nas primeiras horas

---

## Nota sobre Seguranca do Banco

A auditoria automatica flagou 11 findings de "dados expostos" nas tabelas `clients`, `profiles`, `financial_transactions`, `orders`, `subscriptions`, `support_tickets`, `user_settings`, `ingredients`, `recipes`, `products` e `admin_action_logs`. Apos analise manual, **todas as tabelas ja possuem RLS ativo com politicas que restringem acesso por `user_id = auth.uid()`**. Os findings sao falsos positivos — os dados de um usuario NAO sao acessiveis por outro usuario. Nenhuma acao necessaria aqui.

