

# Correcoes Criticas e Novas Funcionalidades

## 1. Erro de salvamento na primeira tentativa (todos os modulos)

### Problema Identificado

Analisando os hooks, a causa provavel e uma condicao de corrida na autenticacao. O objeto `user` pode ser momentaneamente `null` durante o ciclo inicial de carregamento do auth, fazendo com que a primeira mutacao falhe com erro de RLS (o Supabase rejeita a operacao porque nao ha `auth.uid()` valido). Na segunda tentativa o auth ja estabilizou e funciona.

### Solucao

Adicionar uma verificacao defensiva `await supabase.auth.getSession()` no inicio de cada mutacao, garantindo que a sessao esta ativa antes de enviar dados ao banco. Alternativamente, refatorar para usar `session.user` direto em vez de depender do `user` do contexto React.

A abordagem mais simples: em cada hook que faz mutacao, adicionar um `retry: 1` no useMutation e garantir o guard `if (!user?.id)` em todas as mutacoes.

Arquivos afetados:
- `src/hooks/useIngredients.tsx`
- `src/hooks/useRecipes.tsx`
- `src/hooks/useProducts.tsx`
- `src/hooks/useDecorations.tsx`
- `src/hooks/usePackaging.tsx`
- `src/hooks/useClients.tsx`
- `src/hooks/useCategories.tsx`
- `src/hooks/useRecipeCategories.tsx`
- `src/hooks/useDecorationCategories.tsx`
- `src/hooks/usePackagingCategories.tsx`
- `src/hooks/useProductCategories.tsx`
- `src/hooks/useOrders.tsx`
- `src/hooks/useFinancial.tsx`

Padrao a aplicar em cada mutacao:

```text
useMutation({
  mutationFn: async (data) => {
    // Garantir sessao ativa
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Sessao expirada');
    const userId = session.user.id;
    // ... usar userId no insert/update
  },
  retry: 1, // <-- uma retentativa automatica
})
```

---

## 2. Deducao de estoque: bug de conversao de unidades

### Problema Identificado

No `StockDeductionDialog.tsx`, a deducao faz:

```text
newStock = currentStock - quantity
```

Mas `quantity` esta na unidade da receita/produto (ex: 300g) e `currentStock` esta na unidade do cadastro do ingrediente (ex: 1, significando 1kg). O sistema nao converte entre as unidades.

Exemplo: Chocolate cadastrado em **kg**, estoque = 1 (1kg). Receita usa 300**g**. A deducao deveria ser: 1kg - 0.3kg = 0.7kg. Mas o sistema faz: 1 - 300 = -299, limitado a 0.

### Solucao

Na funcao `handleConfirm`, converter a `quantity` para a unidade do estoque antes de deduzir. Precisamos tambem armazenar a unidade do estoque (`stockUnit`) no `MaterialItem`.

Alteracoes no `StockDeductionDialog.tsx`:

1. Adicionar campo `stockUnit` ao `MaterialItem`
2. Na carga de materiais, capturar a unidade do ingrediente/decoracao/embalagem (`ingredient.unit`, `decoration.unit`, `packaging.unit`)
3. Na deducao, usar `convertUnit(quantity, usageUnit, stockUnit)` da lib `unit-conversion.ts`
4. Exibir a quantidade ja convertida para a unidade de estoque na interface

```text
// Antes da deducao:
import { convertUnit } from '@/lib/unit-conversion';

const convertedQty = convertUnit(m.quantity, m.unit, m.stockUnit);
if (convertedQty === null) {
  // Unidades incompativeis, nao deduzir
  continue;
}
const newStock = Math.max(0, (m.currentStock || 0) - convertedQty);
```

Arquivo: `src/components/orders/StockDeductionDialog.tsx`

---

## 3. Deducao de estoque: pular para usuarios sem estoque

### Problema

Mesmo que o usuario nao use controle de estoque (todos os `stock_quantity` sao null), o dialog de deducao aparece ao marcar pedido como entregue.

### Solucao

No `OrdersList.tsx`, apos buscar os materiais, verificar se **algum** material tem `stock_quantity !== null`. Se nenhum material tem estoque cadastrado, pular o dialog automaticamente.

Mais especificamente, no `handleStatusChange`, ao encontrar o pedido:
- Se nenhum item do pedido tem materiais com estoque definido, nao abrir o dialog
- O `StockDeductionDialog` ja mostra "Nenhum material vinculado" quando nao ha materiais, mas vamos evitar abrir o dialog desnecessariamente

Para uma verificacao mais eficiente, podemos fazer a verificacao dentro do `StockDeductionDialog`: se apos carregar os materiais, nenhum tem `currentStock !== null`, fechar automaticamente o dialog sem mostrar nada.

Arquivo: `src/components/orders/StockDeductionDialog.tsx` -- apos `loadMaterials`, se todos os materiais tem `currentStock === null`, chamar `onOpenChange(false)` automaticamente.

---

## 4. Desconto no pedido

### Alteracoes necessarias

**Banco de dados**: Adicionar coluna `discount` (numeric, default 0, nullable false) na tabela `orders`.

**Interface**:
- `OrderForm.tsx`: Adicionar campo "Desconto (R$)" antes do campo de pagamento. O total exibido deve considerar o desconto: `total - discount`.
- `OrderCard.tsx`: Exibir badge de desconto se `discount > 0`.
- `OrderDetails.tsx`: Exibir desconto no resumo financeiro. Ajustar calculo de saldo restante.
- `OrderStatusBadge.tsx`: Sem alteracao.

**Logica de negocios**:
- `useOrders.tsx`: Incluir `discount` no create/update. O `total_amount` permanece como soma dos itens (valor bruto). O `payment_status` usa `total_amount - discount` como referencia.
- Orcamento WhatsApp: Se `discount > 0`, adicionar linha "Desconto: -R$ X,XX" e mostrar "Total com desconto: R$ Y,YY".
- Contas a receber (`ReceivablesList.tsx`): Ajustar calculo de saldo pendente para `total_amount - discount - paid_amount`.
- Auto-registro financeiro: O valor registrado deve ser o `paid_amount` (nao muda, ja funciona corretamente).

Arquivos:
- Migracao SQL: `ALTER TABLE orders ADD COLUMN discount numeric NOT NULL DEFAULT 0;`
- `src/hooks/useOrders.tsx`: Adicionar `discount` em OrderFormData, create/update, e calculo de payment_status
- `src/components/orders/OrderForm.tsx`: Campo de desconto
- `src/components/orders/OrderCard.tsx`: Badge de desconto
- `src/components/orders/OrderDetails.tsx`: Linha de desconto + WhatsApp
- `src/components/financial/ReceivablesList.tsx`: Ajustar calculo de saldo

---

## 5. Assinatura: liberar Dashboard e Suporte para usuarios expirados

### Mudanca de comportamento

Atualmente, quando `canAccess = false`, o `Dashboard.tsx` mostra o `SubscriptionPaywall` e bloqueia tudo.

**Novo comportamento**: Usuarios expirados podem acessar:
- Dashboard (pagina inicial com resumo)
- Suporte (para manter comunicacao com tickets existentes)

Todas as outras paginas continuam bloqueadas.

### Implementacao

No `Dashboard.tsx`, em vez de renderizar `<SubscriptionPaywall />` diretamente quando `!canAccess`, renderizar o `AppLayout` normalmente mas:

1. Permitir navegacao para `dashboard` e `support`
2. Para qualquer outra pagina, mostrar o `SubscriptionPaywall` inline (dentro do layout)
3. No menu lateral, desabilitar visualmente os itens bloqueados

Isso permite que o usuario veja o Dashboard, acesse o suporte, e veja claramente que precisa assinar para usar o restante.

### Excecao para suporte ativo

Se o usuario tem um ticket ativo (`status = 'open' ou 'in_progress'`), ele pode continuar respondendo nesse ticket mesmo expirado. Isso ja funciona naturalmente -- as RLS policies de `support_replies` e `support_tickets` nao verificam subscription, apenas `auth.uid()`. Entao basta liberar o acesso a pagina de suporte.

Arquivos:
- `src/pages/Dashboard.tsx`: Logica de acesso condicional por pagina
- `src/components/layout/AppLayout.tsx`: Indicar visualmente itens bloqueados no menu

---

## Sobre o Financeiro

Voce esta certo. Deduzir automaticamente o custo dos insumos do faturamento nao e viavel porque:
- O preco dos insumos varia (pode ter comprado mais caro)
- O usuario pode ter usado insumos que ja tinha em estoque
- Nao ha como garantir que o custo registrado e o custo real da producao daquele pedido especifico

O modulo financeiro funciona corretamente como esta: registra entradas (pagamentos de pedidos) e saidas (despesas manuais) separadamente, permitindo que o usuario tenha visao clara do fluxo de caixa sem calculos automaticos imprecisos.

---

## Resumo de Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Todos os hooks de mutacao | Editar | Guard de sessao + retry:1 |
| `StockDeductionDialog.tsx` | Editar | Conversao de unidades + pular sem estoque |
| Migracao SQL | Novo | Coluna `discount` na tabela orders |
| `useOrders.tsx` | Editar | Suporte a desconto + payment_status ajustado |
| `OrderForm.tsx` | Editar | Campo de desconto |
| `OrderCard.tsx` | Editar | Badge de desconto |
| `OrderDetails.tsx` | Editar | Desconto no resumo + WhatsApp |
| `ReceivablesList.tsx` | Editar | Calculo com desconto |
| `Dashboard.tsx` | Editar | Acesso condicional por pagina |
| `AppLayout.tsx` | Editar | Menu com itens bloqueados |

### Sequencia de Implementacao

1. Fix erro de salvamento (guards + retry em todos os hooks)
2. Fix conversao de unidades na deducao de estoque
3. Pular deducao quando nao ha estoque cadastrado
4. Adicionar desconto nos pedidos (DB + UI + WhatsApp + contas a receber)
5. Liberar Dashboard e Suporte para usuarios expirados

