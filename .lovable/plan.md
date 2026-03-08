
# Plano de Teste dos Fluxos do Sistema

Baseado na análise do código, vou testar os 4 fluxos principais do sistema de precificação:

## Fluxos a Testar

### 1. **Ingredientes** → Receitas → Produtos → Pedidos  
Testar a cadeia completa de criação, desde a matéria-prima até a venda final.

### 2. **Cálculos de Custo**  
Verificar se os cálculos estão corretos em cada etapa:
- Custo por unidade de ingredientes
- Custo total de receitas (com margem de segurança)
- Custo de produção de produtos (receitas + ingredientes diretos + decorações + embalagens)
- Margem de lucro nos pedidos

### 3. **Conversões de Unidade**  
Validar as conversões automáticas (kg ↔ g, L ↔ ml, etc.)

### 4. **Dependências e Integridade**  
Verificar se o sistema impede exclusões que quebrariam vínculos:
- Ingrediente usado em receita
- Receita usada em produto
- Produto usado em pedido

## Estratégia de Teste

### Teste Prático (via Browser)
Vou executar interações reais com a aplicação:

1. **Criar Ingrediente**
   - Nome: "Farinha de Trigo"
   - Preço: R$ 15,00
   - Quantidade: 5 kg
   - Verificar cálculo: R$ 3,00/kg

2. **Criar Receita**
   - Nome: "Massa de Bolo Básica"
   - Adicionar 0.5kg da farinha criada
   - Rendimento: 2 un
   - Verificar custo calculado automaticamente

3. **Criar Produto**
   - Nome: "Bolo de Chocolate"
   - Adicionar 1 unidade da receita
   - Margem de lucro: 30%
   - Verificar breakdown de custos e preço sugerido

4. **Criar Cliente e Pedido**
   - Cliente: "Maria Silva"
   - Produto: 1x Bolo de Chocolate
   - Verificar cálculo do total e registro financeiro

### Pontos de Verificação

**Após cada etapa:**
- ✓ Dados foram salvos corretamente
- ✓ Cálculos estão precisos
- ✓ Interface atualiza em tempo real
- ✓ Relacionamentos entre entidades funcionam

**Casos Especiais:**
- Tentativa de excluir ingrediente usado em receita (deve alertar)
- Edição de preço de ingrediente (deve atualizar custos)
- Conversão de unidades (ex: adicionar 500g quando ingrediente está em kg)

## Resultado Esperado

Se todos os fluxos funcionarem:
1. **Integridade de dados**: Nenhum erro de RLS ou foreign keys
2. **Cálculos corretos**: Custos e margens calculados corretamente
3. **UX fluido**: Formulários responsivos, feedback visual adequado
4. **Dependências preservadas**: Sistema impede ações que quebram vínculos

## Limitações do Teste

**O que posso testar:**
- Criação, edição e visualização de todas as entidades
- Cálculos de custo em tempo real
- Navegação entre páginas
- Validações de formulário

**O que não posso testar automaticamente:**
- Comportamento sob carga (múltiplos usuários)
- Sincronização realtime entre dispositivos
- Edge cases complexos (ex: receitas com 50+ ingredientes)
- Integrações externas (WhatsApp, Stripe)

## Execução

Vou começar o teste prático navegando para a página de Ingredientes e criando o primeiro item. A cada etapa, documentarei:
- Ação executada
- Resultado obtido
- Problemas encontrados (se houver)
- Screenshots de evidência
