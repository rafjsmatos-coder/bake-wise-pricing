
-- Update FAQ items to match new humanized terminology

-- "custos operacionais indiretos" → "outros gastos do negócio"
UPDATE faq_items SET 
  question = 'O que são os "outros gastos do negócio"?',
  answer = 'São gastos fixos do seu dia a dia que não estão ligados a um produto específico, como:

• Energia elétrica
• Água
• Aluguel do espaço
• Internet
• Materiais de limpeza
• Gás

O sistema aplica uma porcentagem (padrão 5%) sobre o custo total do produto para incluir esses gastos no preço. Você pode ajustar essa porcentagem nas Configurações.',
  updated_at = now()
WHERE question = 'O que são custos operacionais indiretos?';

-- "margem de lucro" → linguagem mais simples
UPDATE faq_items SET 
  question = 'O que é a margem de lucro e como definir?',
  answer = 'A margem de lucro é o quanto você quer ganhar além do que gastou para produzir.

Por exemplo, com margem de 100%:
• Custou produzir: R$ 50,00
• Preço sugerido: R$ 100,00

Você define a margem em cada produto. O padrão é 30%, mas vale ajustar conforme o seu mercado e o valor do seu trabalho.',
  updated_at = now()
WHERE question = 'O que é margem de lucro e como configurar?';

-- "margem de segurança" → "reserva para imprevistos"  
UPDATE faq_items SET 
  question = 'O que é a reserva para imprevistos na receita?',
  answer = 'A reserva para imprevistos adiciona uma porcentagem sobre o custo dos ingredientes para cobrir pequenas perdas do dia a dia (sobras, evaporação, o que gruda na panela...).

Por exemplo, com reserva de 15%, se os ingredientes custam R$ 10,00, o custo calculado será R$ 11,50.

Você pode definir um valor padrão nas Configurações ou ajustar em cada receita.',
  updated_at = now()
WHERE question = 'O que é a margem de segurança na receita?';

-- "configurar custos de mão de obra" → linguagem mais clara
UPDATE faq_items SET 
  question = 'Como configuro o valor do meu tempo e do forno?',
  answer = 'Vá em Configurações e ajuste:

• Seu tempo (mão de obra) — quanto você quer receber por hora de trabalho
• Gasto com forno — valor por hora de uso, separado por tipo (gás ou elétrico)
• Tipo de forno padrão — gás ou elétrico
• Outros gastos do negócio — porcentagem para incluir luz, água, aluguel etc.

Esses valores são usados automaticamente no cálculo de custo dos seus produtos.',
  updated_at = now()
WHERE question = 'Como configuro custos de mão de obra e forno?';

-- "custo do produto" → linguagem mais clara
UPDATE faq_items SET 
  answer = 'O custo total do produto é a soma de tudo que você gasta para produzi-lo:

1. Receitas — custo proporcional de cada receita usada
2. Ingredientes diretos — ingredientes adicionados diretamente no produto
3. Decorações — itens decorativos com seus custos
4. Embalagens — custo das embalagens
5. Custos extras — valores adicionais que você queira incluir
6. Seu tempo — baseado no tempo de decoração × valor da sua hora
7. Gasto com forno — baseado no tempo de forno × custo por hora
8. Outros gastos do negócio — porcentagem sobre o custo total (luz, água, aluguel...)

O preço sugerido aplica a margem de lucro sobre esse custo total.',
  updated_at = now()
WHERE question = 'Como o custo do produto é calculado?';

-- "módulo financeiro" → linguagem mais simples
UPDATE faq_items SET 
  question = 'Como funciona a área financeira?',
  answer = 'A área Financeiro ajuda você a controlar o dinheiro do seu negócio:

• Caixa — registre entradas (vendas, recebimentos) e saídas (compras, contas)
• Resumo — veja como está indo o seu negócio com gráficos e números simples
• A Receber — acompanhe os pedidos com pagamento pendente

Tudo organizado por mês, com filtros para facilitar.',
  updated_at = now()
WHERE question = 'Como funciona o módulo financeiro?';

-- "transações manuais" → linguagem mais simples
UPDATE faq_items SET 
  answer = 'Sim! Quando um pedido é criado, uma entrada é registrada automaticamente na área financeira vinculada àquele pedido.

Você também pode registrar manualmente qualquer entrada ou saída que não esteja ligada a um pedido.',
  updated_at = now()
WHERE question = 'As vendas dos pedidos aparecem automaticamente no financeiro?';

-- "relatórios de faturamento" → linguagem simples
UPDATE faq_items SET 
  question = 'Como vejo o resumo do meu negócio?',
  answer = 'Na área Financeiro, toque na aba Resumo para ver:

• Quanto entrou e quanto saiu no mês
• Quanto sobrou no final
• Valor médio dos pedidos
• Quais produtos mais venderam
• Comparativo dos últimos meses

Use o filtro de mês para analisar períodos diferentes.',
  updated_at = now()
WHERE question = 'Como vejo relatórios de faturamento?';
