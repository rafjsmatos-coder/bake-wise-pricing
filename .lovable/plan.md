

# Correcoes e Melhorias - Cards, Formularios e Integracao WhatsApp

## 1. Badge de categoria cortada em todos os cards

**Problema**: Os cards de Receitas, Decoracoes, Embalagens e Ingredientes usam `max-w-[100px]` no badge da categoria, cortando nomes grandes. O card de Produtos ja foi corrigido para `max-w-[200px]`.

**Solucao**: Aumentar o `max-w` do badge para `200px` em todos os 4 cards, igualando ao padrao do ProductCard.

Arquivos:
- `src/components/recipes/RecipeCard.tsx` (linha 87: `max-w-[100px]` -> `max-w-[200px]`)
- `src/components/decorations/DecorationCard.tsx` (linha 32: idem)
- `src/components/packaging/PackagingCard.tsx` (linha 42: idem)
- `src/components/ingredients/IngredientCard.tsx` (linha 33: idem)

---

## 2. Formulario de pedido "se movendo" no mobile

**Problema**: O Dialog do formulario de pedido pode causar deslocamento da pagina em dispositivos moveis quando o teclado virtual abre ou ao interagir com selects/calendarios dentro do dialog.

**Solucao**: Adicionar classes CSS ao DialogContent para fixar o dialog e evitar deslocamento:
- Usar `fixed inset-0` no mobile para garantir posicionamento estavel
- Adicionar `overscroll-behavior: contain` para evitar scroll propagation
- Garantir que o Popover do calendario use `modal={true}` e `side="top"` em mobile

Arquivo: `src/components/orders/OrderForm.tsx`

---

## 3. Campo "Valor pago" com problemas

**Problema 1**: O campo usa `type="number"` que nao aceita virgula como separador decimal (padrao brasileiro).
**Problema 2**: O campo inicia com valor `0` ao inves de vazio.

**Solucao**:
- Mudar o campo para `type="text"` com `inputMode="decimal"` para aceitar virgula
- Iniciar com string vazia ao inves de `0`
- Ao processar, converter virgula para ponto e parsear para numero
- Aplicar mesma logica nos campos de preco/quantidade do `OrderProductSelector.tsx`

Arquivos: `src/components/orders/OrderForm.tsx`, `src/components/orders/OrderProductSelector.tsx`

---

## 4. Padronizar layouts das paginas

**Analise**: As paginas de lista (produtos, receitas, ingredientes, etc.) ja seguem um padrao consistente com header + contador + botao + grid. Os cards de Decoracoes e Embalagens nao tem botoes "Ver" e "Duplicar" como os cards de Receitas e Produtos.

**Solucao**: Nao mexer nisso agora, pois decoracoes e embalagens sao itens simples sem tela de detalhes elaborada. O padrao atual esta consistente dentro de cada tipo de modulo.

---

## 5. Formatacao de telefone, celular, WhatsApp e email

**Solucao**: Criar uma funcao utilitaria `formatPhone` que aplica mascara automatica `(00) 00000-0000` enquanto o usuario digita. Aplicar nos campos de telefone e WhatsApp do formulario de cliente.

- O campo de email permanece como `type="email"` (validacao nativa do navegador)
- A mascara formata automaticamente conforme o usuario digita, adicionando parenteses e hifen

Arquivos:
- `src/lib/format-utils.ts` (novo - funcoes de formatacao)
- `src/components/clients/ClientForm.tsx` (aplicar mascara nos campos phone e whatsapp)

---

## 6. Enviar orcamento via WhatsApp

**Solucao**: Integrar um botao "Enviar Orcamento" na tela de detalhes do pedido (OrderDetails). Ao clicar, o sistema:

1. Monta uma mensagem formatada com os dados do pedido:
   - Nome do cliente
   - Lista de produtos com quantidade e preco
   - Total do pedido
   - Data de entrega
   - Observacoes

2. Abre o WhatsApp Web/App com a mensagem pronta usando `https://wa.me/{numero}?text={mensagem}`

3. O numero vem do cadastro do cliente (campo WhatsApp)

Se o cliente nao tiver WhatsApp cadastrado, o botao fica desabilitado com tooltip explicando.

Exemplo da mensagem:
```text
Ola {nome}! Segue o orcamento do seu pedido:

- 1x Bolo de Chocolate - R$ 120,00
- 2x Brigadeiro (cento) - R$ 80,00

Total: R$ 200,00
Entrega: 15/02/2026 as 14:00

Observacoes: Sem lactose

Obrigado(a) pela preferencia!
```

Arquivos:
- `src/components/orders/OrderDetails.tsx` (adicionar botao + logica de montar mensagem)
- `src/hooks/useClients.tsx` (buscar dados do cliente com WhatsApp)

---

## 7. Card de proximas entregas no Dashboard

**Solucao**: Adicionar um card "Proximas Entregas" no Dashboard mostrando os proximos 5 pedidos com entrega agendada (apenas status pendente, em producao ou pronto). Cada item mostra:
- Nome do cliente
- Data/hora de entrega
- Badge de status
- Total do pedido

O card fica acima dos cards de Assinatura e Dicas, junto com os cards de Alertas de Estoque e Configuracao de Custos.

Arquivo: `src/components/dashboard/DashboardHome.tsx`

---

## Detalhes Tecnicos

### Funcao de formatacao de telefone

```text
Arquivo: src/lib/format-utils.ts

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}
```

### Campo de valor com suporte a virgula

```text
// Estado como string
const [paidAmountStr, setPaidAmountStr] = useState('');

// No input
<Input
  type="text"
  inputMode="decimal"
  value={paidAmountStr}
  onChange={(e) => setPaidAmountStr(e.target.value)}
  placeholder="0,00"
/>

// Ao submeter
const paidAmount = parseFloat(paidAmountStr.replace(',', '.')) || 0;
```

### Botao WhatsApp no OrderDetails

```text
// Montar URL do WhatsApp
const whatsappNumber = cleanPhone(order.client?.whatsapp || '');
const message = buildOrderMessage(order);
const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, '_blank');
```

---

## Resumo de Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `RecipeCard.tsx` | max-w badge: 100px -> 200px |
| `DecorationCard.tsx` | max-w badge: 100px -> 200px |
| `PackagingCard.tsx` | max-w badge: 100px -> 200px |
| `IngredientCard.tsx` | max-w badge: 100px -> 200px |
| `OrderForm.tsx` | Fix mobile layout + campo valor com virgula |
| `OrderProductSelector.tsx` | Campos preco com suporte a virgula |
| `src/lib/format-utils.ts` | Novo: funcoes formatPhone, cleanPhone |
| `ClientForm.tsx` | Mascara de telefone nos campos phone/whatsapp |
| `OrderDetails.tsx` | Botao "Enviar Orcamento" via WhatsApp |
| `DashboardHome.tsx` | Card "Proximas Entregas" |

