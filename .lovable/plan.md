

# Plano: Cadastro de Dados via CSV na Conta Rafinha Matos

## Contexto
- **Conta destino**: Rafinha Matos (`b596f0e5-5309-4e5c-ab89-7a321aa113a4`)
- Conta está vazia (sem ingredientes, receitas ou produtos)
- Todas as categorias padrão já existem

## Problema: Categorias de Produto ausentes
O CSV `produtos.csv` usa categorias que **não existem** nas `product_categories` dessa conta:
- **"Datas Comemorativas"** → mais próxima: "Caixas Presenteáveis"
- **"Bolos no Pote"** → mais próxima: "Doces no Pote"
- **"Biscoitos e Cookies"** → não existe
- **"Bolos (Caseiros/Personalizados)"** → mais próxima: "Bolos Simples" ou "Bolos Decorados"

**Proposta**: Criar as categorias ausentes como novas `product_categories` para a conta, mantendo os nomes exatos do CSV.

## Problema: Categoria de Ingrediente "Oleaginosas"
O CSV usa "Oleaginosas" mas a conta tem "Castanhas" (que inclui nozes, amêndoas, pistache). **Proposta**: Mapear "Oleaginosas" → "Castanhas".

## Problema: Unidade "l" vs "L"
O CSV usa `l` (minúsculo) para litros, mas o enum do banco usa `L` (maiúsculo). Será convertido automaticamente.

## Abordagem técnica
Criar uma **edge function temporária** (`seed-user-data`) que recebe o `user_id` e executa todos os inserts na ordem correta, usando o Supabase service role key para bypass de RLS. Após confirmar que os dados foram inseridos, a edge function será removida.

## Ordem de execução (dentro da edge function)

### 1. Criar product categories ausentes
- "Datas Comemorativas", "Biscoitos e Cookies", "Bolos no Pote", "Bolos (Caseiros/Personalizados)"

### 2. Ingredientes (85 itens)
- Inserir todos os 85 ingredientes com: name, purchase_price, package_quantity, unit (corrigindo l→L), category_id (mapeado), cost_per_unit (calculado)

### 3. Embalagens (6 itens)
- Inserir todas as 6 embalagens com category_id mapeado

### 4. Decorações (5 itens)
- Inserir todas as 5 decorações com category_id mapeado

### 5. Receitas (5 receitas)
- Inserir as 5 receitas com category_id mapeado, yield_quantity, yield_unit, prep_time, cook_time, instructions, notes

### 6. Receita ↔ Ingredientes (35 vínculos)
- Buscar IDs dos ingredientes e receitas recém-criados por nome
- Inserir em `recipe_ingredients`

### 7. Produtos (5 produtos)
- Inserir com category_id (das novas categorias), profit_margin_percent, decoration_time_minutes, additional_costs, notes

### 8. Produto ↔ Receitas (5 vínculos)
- Vincular em `product_recipes`

### 9. Produto ↔ Ingredientes avulsos
- Arquivo vazio, nada a fazer

### 10. Produto ↔ Decorações (10 vínculos)
- Vincular em `product_decorations`

### 11. Produto ↔ Embalagens (10 vínculos)
- Vincular em `product_packaging`

### 12. Limpeza
- Deletar a edge function temporária

## Detalhes técnicos
- A edge function usará `SUPABASE_SERVICE_ROLE_KEY` para inserir com o `user_id` correto
- Todos os nomes serão usados **exatamente** como estão nos CSVs
- `cost_per_unit` será calculado como `purchase_price / package_quantity`
- Nenhum dado existente será removido
- Nenhuma funcionalidade será alterada

