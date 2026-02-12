

# Melhorias Finais: Auto-registro Financeiro, Dashboard, Mobile, PWA e Landing Page

## 1. Auto-registrar pagamentos no fluxo de caixa

Quando um pedido for salvo (criado ou atualizado) com valor pago maior que zero, o sistema registra automaticamente uma transacao do tipo "income" na tabela `financial_transactions` com categoria "Venda de Pedido" e referencia ao pedido (`order_id`).

Para evitar duplicatas: antes de inserir, verifica se ja existe transacao vinculada aquele `order_id`. Se existir, atualiza o valor. Se nao, cria nova.

Arquivo: `src/hooks/useOrders.tsx` -- adicionar logica apos `createOrder` e `updateOrder` para inserir/atualizar transacao financeira automaticamente.

---

## 2. Remover Acoes Rapidas do Dashboard e atualizar Tour

**Dashboard**: Remover o bloco "Acoes Rapidas" (quickActions) do `DashboardHome.tsx`. Os summary cards ja servem como navegacao rapida.

**Tour**: Remover o step 2 (quick-actions) do `TourProvider.tsx` e ajustar os indices dos steps que controlam a sidebar (de `[3,4,5,6,7,8]` para `[2,3,4,5,6,7]`).

Arquivos:
- `src/components/dashboard/DashboardHome.tsx` -- remover quickActions e o card correspondente
- `src/components/tour/TourProvider.tsx` -- remover step "Acoes Rapidas" e reindexar sidebarSteps

---

## 3. OrderDetails maior que a tela no mobile

O dialog de detalhes do pedido esta sem restricao de overflow. A area de botoes no header (Orcamento, Duplicar, Editar) ocupa espaco demais em telas pequenas.

Solucao:
- Adicionar `overflow-x-hidden` e `touchAction: 'pan-y'` ao DialogContent (mesmo padrao do OrderForm)
- Reorganizar botoes no header para empilhar verticalmente em mobile usando `flex-wrap`
- Garantir que textos longos (observacoes, nomes de produtos) usem `break-words`

Arquivo: `src/components/orders/OrderDetails.tsx`

---

## 4. PWA (Progressive Web App)

Instalar e configurar `vite-plugin-pwa` para transformar o site em app instalavel. Isso permite que confeiteiros "instalem" o PreciBake no celular direto do navegador, com icone na home screen, splash screen e funcionamento offline basico.

Configuracao:
- Instalar `vite-plugin-pwa`
- Configurar em `vite.config.ts` com manifest (nome, cores, icones)
- Adicionar meta tags de PWA no `index.html` (theme-color, apple-touch-icon)
- Criar icones PWA em `/public/` (192x192 e 512x512)
- Adicionar `navigateFallbackDenylist: [/^\/~oauth/]` no workbox config
- Criar pagina `/install` opcional com instrucoes de instalacao

Arquivos:
- `vite.config.ts` -- adicionar VitePWA plugin
- `index.html` -- meta tags PWA
- `public/pwa-192x192.png` e `public/pwa-512x512.png` -- icones (gerados com placeholder)

---

## 5. Atualizar Landing Page (one page)

Atualizar o conteudo e SEO da landing page para refletir todas as funcionalidades atuais do sistema (pedidos, clientes, financeiro, lista de compras, WhatsApp, etc).

### SEO
- `index.html`: melhorar meta tags (description mais completa, keywords, canonical URL, structured data JSON-LD)
- `robots.txt`: ja esta bom
- Adicionar sitemap basico ou referencia

### Conteudo da Landing Page

**HeroSection**: Atualizar subtitulo para mencionar "gestao completa" (nao so precificacao). Adicionar mais badges (ex: "Gestao de Pedidos", "Controle Financeiro").

**FeaturesSection**: Adicionar os novos modulos:
- Gestao de Pedidos e Clientes
- Orcamento via WhatsApp
- Controle Financeiro (fluxo de caixa, relatorios)
- Lista de Compras Automatica
- Controle de Estoque
- PWA (funciona no celular como app)

**PainPointsSection/BenefitsSection**: Revisar textos para incluir dores de gestao (nao so precificacao).

Arquivos:
- `index.html` -- SEO aprimorado
- `src/components/landing/HeroSection.tsx` -- atualizar copy
- `src/components/landing/FeaturesSection.tsx` -- adicionar novos features
- Demais secoes da landing conforme necessario

---

## Detalhes Tecnicos

### Auto-registro financeiro (useOrders.tsx)

```text
// Apos criar/atualizar pedido com sucesso:
const paidAmount = data.paid_amount;
if (paidAmount > 0) {
  // Verificar se ja existe transacao para este order_id
  const { data: existing } = await supabase
    .from('financial_transactions')
    .select('id')
    .eq('order_id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('financial_transactions')
      .update({ amount: paidAmount, date: new Date().toISOString().split('T')[0] })
      .eq('id', existing.id);
  } else {
    await supabase.from('financial_transactions')
      .insert({
        user_id: user.id,
        type: 'income',
        category: 'Venda de Pedido',
        description: `Pagamento pedido - ${clientName}`,
        amount: paidAmount,
        date: new Date().toISOString().split('T')[0],
        order_id: orderId,
      });
  }
}
```

### PWA Config (vite.config.ts)

```text
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    navigateFallbackDenylist: [/^\/~oauth/],
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
  manifest: {
    name: 'PreciBake - O ponto certo do preco',
    short_name: 'PreciBake',
    description: 'Sistema de precificacao e gestao para confeiteiros',
    theme_color: '#1e293b',
    background_color: '#f5f6fa',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

### SEO (index.html)

```text
<meta name="keywords" content="precificacao confeitaria, calcular preco bolo, ..." />
<link rel="canonical" href="https://bake-wise-pricing.lovable.app/" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PreciBake",
  "applicationCategory": "BusinessApplication",
  ...
}
</script>
```

---

## Resumo de Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `useOrders.tsx` | Editar | Auto-registro de pagamentos no financeiro |
| `DashboardHome.tsx` | Editar | Remover Acoes Rapidas |
| `TourProvider.tsx` | Editar | Remover step quick-actions, reindexar |
| `OrderDetails.tsx` | Editar | Fix overflow mobile |
| `vite.config.ts` | Editar | Adicionar VitePWA |
| `index.html` | Editar | Meta tags PWA + SEO |
| `HeroSection.tsx` | Editar | Atualizar copy e badges |
| `FeaturesSection.tsx` | Editar | Adicionar novos modulos |

### Sequencia de Implementacao

1. Auto-registro financeiro
2. Remover acoes rapidas + atualizar tour
3. Fix OrderDetails mobile
4. Configurar PWA
5. Atualizar landing page + SEO

