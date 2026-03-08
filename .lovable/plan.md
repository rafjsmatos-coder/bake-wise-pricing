

# Promoção "Primeiro Mês R$29,90" para os 25 Primeiros

## Minha Recomendação

O problema que você levantou é real: se contarmos os 25 slots pelo cadastro (trial), qualquer pessoa que se cadastra e nunca paga "desperdiça" uma vaga. 

**A melhor abordagem: contar apenas quem realmente pagou.** Os 25 slots são consumidos no momento do checkout, não no signup. Assim:
- Cadastrou e ficou no trial? Não consome vaga.
- Cadastrou, trial expirou, decidiu assinar? Aí sim consome a vaga (se ainda houver).

## Como funciona tecnicamente

1. **Cupom no Stripe** -- Criar um cupom com desconto fixo de R$20,00 (R$49,90 - R$29,90), válido apenas para o primeiro mês (`duration: 'once'`), com `max_redemptions: 25`.

2. **`create-checkout`** -- Antes de criar a sessão, verificar no Stripe se o cupom ainda tem resgates disponíveis. Se sim, aplicar automaticamente via `discounts: [{ coupon: 'COUPON_ID' }]`. Se não, criar sessão sem desconto.

3. **Endpoint de contagem** -- Criar uma edge function leve (`promo-status`) que retorna `{ slotsUsed, slotsTotal, isActive }` consultando o cupom no Stripe.

4. **UI** -- Atualizar PricingSection, SubscriptionPaywall e SubscriptionCard para mostrar:
   - "De R$59,90 por R$29,90 no primeiro mês" (com o preço riscado)
   - "Restam X vagas de 25" (contador dinâmico)
   - Quando esgotado: volta ao preço normal sem menção à promoção

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| Stripe (via tool) | Criar cupom `LAUNCH_25` com R$20 off, `duration: once`, `max_redemptions: 25` |
| `supabase/functions/create-checkout/index.ts` | Verificar cupom e aplicar `discounts` na sessão |
| `supabase/functions/promo-status/index.ts` | Nova function -- retorna vagas restantes |
| `src/hooks/usePromoStatus.tsx` | Novo hook -- consulta `promo-status` |
| `src/components/landing/PricingSection.tsx` | Exibir R$29,90 primeiro mês + contador de vagas |
| `src/components/subscription/SubscriptionPaywall.tsx` | Exibir promoção + vagas restantes |
| `src/components/subscription/SubscriptionCard.tsx` | Mostrar promoção no card do dashboard |

## Fluxo do usuário

1. Landing page: vê "R$29,90 no primeiro mês · Restam 18 de 25 vagas"
2. Se cadastra, usa trial de 7 dias normalmente
3. Trial expira, paywall mostra a promoção (se ainda houver vagas)
4. Clica "Assinar", checkout do Stripe já vem com desconto aplicado
5. Segundo mês em diante: R$49,90 automaticamente (o Stripe cuida disso)

## Vantagens dessa abordagem
- **Zero risco de desperdício**: só conta quem pagou
- **Stripe controla o limite**: `max_redemptions: 25` é enforced pelo próprio Stripe
- **Urgência real**: o contador diminui conforme pessoas pagam, criando FOMO genuíno
- **Sem complexidade no banco**: não precisa de tabela nova, o Stripe é a fonte de verdade

