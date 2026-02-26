

## Seção "Antes vs Depois" na Landing Page

Criar uma nova seção visual que mostra o contraste entre a realidade de uma confeiteira sem o PreciBake e com o PreciBake. Posicionada logo após a `PainPointsSection` e antes da `BenefitsSection`.

---

### 1. Criar `src/components/landing/BeforeAfterSection.tsx`

Layout lado a lado (empilhado no mobile) com dois cards:

**Card "Antes"** (tom vermelho/destructive):
- Titulo: "Sem PreciBake"
- Icone de alerta
- Itens com X vermelho:
  - Anota precos no caderno ou planilha
  - Esquece custos como gas, luz e embalagem
  - Cobra "no olho" e torce pra dar lucro
  - Perde tempo montando orcamento no WhatsApp
  - Nao sabe se o pedido deu lucro ou prejuizo

**Card "Depois"** (tom verde/accent):
- Titulo: "Com PreciBake"
- Icone de check
- Itens com check verde:
  - Custo calculado automaticamente com todos os gastos
  - Preco de venda sugerido com margem real
  - Orcamento profissional enviado em 1 clique
  - Calendario de pedidos organizado com status
  - Lucro real visivel em cada encomenda

Seta central animada conectando os dois lados (no desktop).

---

### 2. Atualizar `LandingPage.tsx`

Importar e inserir `<BeforeAfterSection />` entre `<PainPointsSection />` e `<BenefitsSection />` (linha 28).

---

### Arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/landing/BeforeAfterSection.tsx` | Criar |
| `src/components/landing/LandingPage.tsx` | Adicionar import e componente |

