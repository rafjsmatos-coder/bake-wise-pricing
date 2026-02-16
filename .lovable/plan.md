
## Plano Completo: Validade dos Ingredientes + Alertas + Limpeza de Cards + Tour

---

### Parte 1: Ativar a data de validade nos Ingredientes

Atualmente o campo `expiry_date` e coletado no formulario mas nunca exibido. Vamos ativa-lo:

**No card do ingrediente (`IngredientCard.tsx`):**
- Exibir a data de validade quando preenchida, com icone de calendario
- Destacar em vermelho quando vencido (data passada)
- Destacar em amarelo quando proximo do vencimento (7 dias ou menos)

**Manter o botao "Ver" (Eye) no IngredientCard** -- pois o ingrediente tem dados extras (historico de precos, validade detalhada) que justificam uma visualizacao mais completa.

---

### Parte 2: Alertas de vencimento no Dashboard

**No `StockAlertsCard.tsx`:**
- Adicionar uma nova secao de alertas de validade, similar aos alertas de estoque
- Verificar ingredientes com `expiry_date` preenchido
- Classificar como: **Vencido** (data passada) ou **Vence em breve** (proximos 7 dias)
- Exibir com icone de calendario e cores diferenciadas (vermelho para vencido, amarelo para vence em breve)

---

### Parte 3: Remover botao "Ver" de Decoracoes e Embalagens

Decoracoes e Embalagens nao tem campos ocultos que justifiquem uma pagina de visualizacao -- todas as informacoes (marca, fornecedor, dimensoes, estoque) ja aparecem no card.

| Arquivo | Alteracao |
|---------|----------|
| `DecorationCard.tsx` | Remover `onView` da interface, remover prop, remover botao Eye |
| `PackagingCard.tsx` | Remover `onView` da interface, remover prop, remover botao Eye |
| `DecorationsList.tsx` | Remover prop `onView` do `<DecorationCard>` |
| `PackagingList.tsx` | Remover prop `onView` do `<PackagingCard>` |

Botoes restantes nesses cards: **Duplicar (Copy), Editar (Pencil), Excluir (Trash)**

---

### Parte 4: Consertar o Tour Guiado

O tour quebrou porque os seletores `[data-tour="nav-*"]` apontam para o sidebar desktop, que nao existe no mobile. A solucao e criar dois conjuntos de passos:

**Tour Mobile (5 passos):**

| Passo | Selector | Conteudo |
|-------|----------|----------|
| 0 | `[data-tour="welcome"]` | Bem-vindo ao PreciBake! |
| 1 | `[data-tour="summary-cards"]` | Visao Geral - clique nos cards para navegar |
| 2 | `[data-tour="bottom-nav"]` | Barra de navegacao inferior |
| 3 | `[data-tour="bottom-more"]` | Menu "Mais" para Ingredientes, Receitas, etc. |
| 4 | `[data-tour="welcome"]` | Pronto para comecar! |

**Tour Desktop (9 passos):**
Mantido como esta atualmente (sidebar nav items).

**Arquivos a modificar:**

| Arquivo | Alteracao |
|---------|----------|
| `TourProvider.tsx` | Criar steps condicionais com `isMobile`. Remover logica de `onSidebarToggle` no mobile. |
| `BottomNav.tsx` | Adicionar `data-tour="bottom-nav"` no `<nav>` e `data-tour="bottom-more"` no botao "Mais" |

---

### Resumo de todos os arquivos

| Arquivo | Alteracoes |
|---------|-----------|
| `src/components/ingredients/IngredientCard.tsx` | Exibir `expiry_date` com indicadores visuais (vencido/vence em breve) |
| `src/components/dashboard/StockAlertsCard.tsx` | Adicionar secao de alertas de validade (vencidos + proximos 7 dias) |
| `src/components/decorations/DecorationCard.tsx` | Remover botao Eye e prop `onView` |
| `src/components/packaging/PackagingCard.tsx` | Remover botao Eye e prop `onView` |
| `src/components/decorations/DecorationsList.tsx` | Remover prop `onView` do card |
| `src/components/packaging/PackagingList.tsx` | Remover prop `onView` do card |
| `src/components/tour/TourProvider.tsx` | Steps condicionais mobile/desktop, remover sidebar toggle no mobile |
| `src/components/layout/BottomNav.tsx` | Adicionar atributos `data-tour` |
