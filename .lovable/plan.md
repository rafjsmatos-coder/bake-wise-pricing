
# Repaginacao das Categorias com Descricoes

## Resumo do Projeto
Adicionar descricoes a todas as categorias do sistema, expandir as categorias padrao para novos usuarios e repaginar a interface visual das paginas de categorias.

---

## Alteracoes no Banco de Dados

### 1. Adicionar coluna `description` em todas as tabelas de categorias

Sera necessario executar uma migracao SQL que adiciona a coluna `description` (TEXT, nullable) nas 5 tabelas de categorias:
- `categories` (ingredientes)
- `recipe_categories` (receitas)
- `decoration_categories` (decoracoes)
- `packaging_categories` (embalagens)
- `product_categories` (produtos)

### 2. Atualizar funcoes de criacao de categorias padrao

Reescrever os triggers que criam categorias automaticas para novos usuarios, adicionando:
- Novas categorias conforme fornecido
- Descricoes para cada categoria

---

## Categorias Padrao com Descricoes

### Ingredientes (categories)
| Nome | Descricao |
|------|-----------|
| Acucares | Acucar refinado, cristal, de confeiteiro, mascavo, demerara, etc. |
| Castanhas | Nozes, amendoas, castanha-do-para, castanha de caju, pistache, etc. |
| Chocolates | Chocolate em barra, gotas, cobertura fracionada, cacau em po, etc. |
| Condimentos | Canela, noz-moscada, cravo, pimenta, especiarias em geral. |
| Essencias | Extratos e essencias aromaticas como baunilha, amendoa, laranja, etc. |
| Farinhas | Farinha de trigo, de amendoas, de arroz, integral, sem gluten, etc. |
| Frutas | Frutas frescas, secas, cristalizadas ou em calda. |
| Laticinios | Leite, creme de leite, leite condensado, manteiga, iogurte, etc. |
| Leguminosas | Feijao, grao-de-bico, lentilha - usados em receitas especiais ou funcionais. |
| Ovos | Ovos inteiros, claras, gemas, ovos pasteurizados. |
| Fermentos e Bicarbonatos | Fermento quimico, biologico, bicarbonato de sodio. |
| Gorduras e Oleos | Manteiga, margarina, oleo vegetal, gordura hidrogenada. |
| Corantes e Decorativos | Corantes em gel, po, confeitos, granulados, glitters comestiveis. |
| Emulsificantes e Estabilizantes | Gelatina, liga neutra, CMC, glicerina. |
| Bebidas e Liquidos | Agua, leite vegetal, sucos, cafe, bebidas alcoolicas. |
| Produtos Industrializados | Leite condensado, creme de leite, chantilly pronto. |
| Graos e Cereais | Aveia, linhaca, chia, flocos de arroz. |
| Sal e Realcadores de Sabor | Sal refinado, flor de sal, glutamato monossodico. |
| Produtos Diet/Light | Adocantes, leite zero lactose, creme vegetal. |
| Ingredientes Sazonais | Frutas cristalizadas, especiarias natalinas. |
| Outros | Ingredientes diversos que nao se encaixam nas categorias principais. |

### Receitas (recipe_categories)
| Nome | Descricao |
|------|-----------|
| Bolos | Receitas completas de bolos simples ou decorados. |
| Caldas e Xaropes | Preparos liquidos para umedecer bolos ou finalizar sobremesas. |
| Coberturas e Glaces | Camadas externas para bolos e cupcakes, como chantilly, buttercream, etc. |
| Cremes e Mousses | Recheios leves e aerados para tortas, bolos e copinhos. |
| Ganaches | Misturas de chocolate com creme de leite para coberturas e recheios. |
| Massas de Bolo | Bases de bolos em diferentes sabores e texturas. |
| Massas Folhadas | Receitas de massa crocante para mil-folhas, folhados e tortinhas. |
| Recheios | Preparos densos ou cremosos para rechear bolos, doces e tortas. |
| Doces Tradicionais | Brigadeiro, beijinho, cajuzinho, etc. |
| Doces Finos | Trufas, camafeus, bombons sofisticados. |
| Biscoitos e Cookies | Receitas base para produtos crocantes. |
| Cupcakes | Massas e coberturas especificas. |
| Tortas Doces | Torta de limao, morango, chocolate. |
| Sobremesas Geladas | Pave, mousse, gelatina, sorvete artesanal. |
| Bolos no Pote | Receitas adaptadas para porcoes individuais. |
| Paes Doces | Sonhos, roscas, cinnamon rolls. |
| Produtos Sazonais | Panetone, ovos de Pascoa, doces juninos. |
| Doces no Pote | Brigadeiro de colher, pudim, mousse no pote. |
| Linha Fit/Diet/Low Carb | Receitas com restricoes ou foco em saude. |
| Decoracao com Pasta Americana | Tecnicas e receitas especificas. |
| Caixas Presenteaveis | Receitas combinadas para kits e boxes. |
| Doces Regionais | Cocada, quindim, pe de moleque. |
| Outros | Receitas diversas que nao se encaixam nas categorias principais. |

### Decoracoes (decoration_categories)
| Nome | Descricao |
|------|-----------|
| Confeitos e Granulados | Micangas, bolinhas, flocos e granulados para decorar doces e bolos. |
| Corantes | Corantes em gel, liquido ou po para colorir massas, coberturas e decoracoes. |
| Fitas e Lacos | Elementos decorativos externos para caixas, potes e kits presenteaveis. |
| Flores e Folhagens | Flores artificiais, naturais ou comestiveis para acabamento delicado. |
| Papeis Comestiveis | Papel arroz, transfer e folhas decorativas comestiveis para bolos e doces. |
| Pasta Americana | Massa modelavel usada para cobrir bolos ou criar figuras decorativas. |
| Toppers | Plaquinhas, miniaturas e enfeites posicionados sobre bolos e cupcakes. |
| Floquinhos e Glitter Comestivel | Brilho e textura para doces e bolos. |
| Modelagens em Pasta | Personagens, flores, toppers moldados a mao. |
| Stencil e Texturizadores | Usados com glace ou aerografo para criar padroes. |
| Aerografos e Tintas Alimentares | Pintura direta sobre bolos e doces. |
| Papel Arroz e Transfer | Imagens comestiveis para aplicacao em bolos. |
| Decoracoes Tematicas | Itens para datas comemorativas (Natal, Pascoa, Halloween). |
| Decoracoes Infantis | Personagens, cores vibrantes, miniaturas ludicas. |
| Decoracoes Naturais | Frutas, flores naturais comestiveis, folhas. |
| Decoracoes Personalizadas | Nomes, frases, iniciais, toppers sob medida. |
| Apliques de Chocolate | Moldes e figuras feitas com chocolate. |
| Decoracoes Fit/Diet | Sem acucar, com ingredientes saudaveis e visuais leves. |
| Miniaturas e Figuras 3D | Pecas decorativas em pasta ou isopor para destaque. |
| Outros | Itens decorativos diversos que nao se encaixam nas categorias principais. |

### Embalagens (packaging_categories)
| Nome | Descricao |
|------|-----------|
| Caixas | Embalagens estruturadas para bolos, doces e kits, com ou sem visor transparente. |
| Etiquetas | Adesivos para identificacao de produtos, ingredientes, validade ou personalizacao. |
| Fitas para Embalagem | Fitas decorativas para lacos, fechamento de caixas e acabamento de kits. |
| Forminhas | Suportes individuais para doces finos, brigadeiros, cupcakes e bombons. |
| Papeis e Celofanes | Material para embrulhar, proteger ou decorar doces e embalagens. |
| Potes e Tampas | Recipientes plasticos ou acrilicos para sobremesas no pote, cremes e mousses. |
| Sacos e Sacolas | Embalagens flexiveis para transporte, entrega ou agrupamento de produtos. |
| Bandejas e Bases | Para bolos, tortas, doces finos. |
| Caixas Presenteaveis | Com visor, decoradas, para combos e kits. |
| Embalagens Termicas | Isopor, aluminio, mantas termicas. |
| Embalagens Personalizadas | Com nome, logo, tema de festa. |
| Embalagens Sustentaveis | Papel kraft, biodegradaveis, reciclaveis. |
| Embalagens para Doces no Pote | Potes especificos com tampa, etiquetas. |
| Embalagens para Cupcakes | Individuais, multiplas, com suporte. |
| Embalagens para Brownies e Cookies | Saquinhos, caixinhas, envelopes. |
| Embalagens para Sobremesas Geladas | Potes vedados, resistentes a temperatura. |
| Embalagens para Produtos Sazonais | Pascoa, Natal, Dia das Maes, etc. |
| Embalagens Fit/Diet | Com visual leve, clean, voltadas para publico saudavel. |
| Embalagens Infantis | Coloridas, com personagens, para festas de crianca. |
| Outros | Itens diversos que nao se encaixam nas categorias principais. |

### Produtos (product_categories)
| Nome | Descricao |
|------|-----------|
| Bolos Decorados | Bolos personalizados com decoracao elaborada. |
| Cupcakes | Bolinhos individuais decorados. |
| Doces Finos | Doces sofisticados para eventos. |
| Kits Festa | Combos tematicos para festas. |
| Tortas | Tortas doces e salgadas. |
| Encomendas Especiais | Produtos personalizados sob demanda. |
| Bolos Simples | Bolos caseiros sem decoracao elaborada. |
| Doces Tradicionais | Brigadeiro, beijinho, cajuzinho, etc. |
| Doces no Pote | Bolo de pote, pudim de pote. |
| Sobremesas Geladas | Mousse, pave, sorvetes artesanais. |
| Paes Doces | Roscas, sonhos, cinnamon rolls. |
| Linha Infantil | Cake pops, pirulitos de chocolate. |
| Produtos Sazonais | Ovos de Pascoa, panetones, doces juninos. |
| Sobremesas Fit/Diet/Low Carb | Opcoes sem acucar ou com foco em saude. |
| Caixas Presenteaveis | Combos tematicos, box de doces. |
| Doces Regionais | Quindim, cocada, pe de moleque. |
| Recheios e Coberturas | Para venda avulsa. |
| Outros | Produtos diversos que nao se encaixam nas categorias principais. |

---

## Alteracoes na Interface (Frontend)

### 1. Atualizar Hooks de Categorias
Adicionar suporte ao campo `description` nos 5 hooks:
- `useCategories.tsx`
- `useRecipeCategories.tsx`
- `useDecorationCategories.tsx`
- `usePackagingCategories.tsx`
- `useProductCategories.tsx`

### 2. Atualizar Formularios de Categorias
Adicionar campo de descricao (textarea) nos 5 formularios:
- `CategoryForm.tsx`
- `RecipeCategoryForm.tsx`
- `DecorationCategoryForm.tsx`
- `PackagingCategoryForm.tsx`
- `ProductCategoryForm.tsx`

### 3. Repaginar Listas de Categorias
Atualizar as 5 paginas de listagem para exibir descricoes:
- `CategoriesList.tsx`
- `RecipeCategoriesList.tsx`
- `DecorationCategoriesList.tsx`
- `PackagingCategoriesList.tsx`
- `ProductCategoriesList.tsx`

Mudancas visuais:
- Cards maiores com espaco para descricao
- Descricao exibida em texto secundario abaixo do nome
- Truncamento inteligente para descricoes longas
- Tooltip para ver descricao completa

---

## Arquitetura das Mudancas

```text
+-------------------+     +----------------------+
|  Migracao SQL     |     |  Triggers Atualizados|
|  - Adicionar      |     |  - Novas categorias  |
|    description    |     |  - Com descricoes    |
+--------+----------+     +----------+-----------+
         |                           |
         v                           v
+-------------------+     +----------------------+
|  5 Hooks          |     |  5 Formularios       |
|  - Interface      |     |  - Campo description |
|    atualizada     |     |  - Textarea          |
+--------+----------+     +----------+-----------+
         |                           |
         v                           v
+------------------------------------------------+
|           5 Listas de Categorias               |
|  - Cards com descricao visivel                 |
|  - Layout repaginado                           |
+------------------------------------------------+
```

---

## Resumo de Implementacao

| Componente | Tipo | Alteracao |
|------------|------|-----------|
| Migracao SQL | Banco | Adicionar coluna `description` em 5 tabelas |
| Triggers | Banco | Reescrever 5 funcoes com novas categorias e descricoes |
| useCategories.tsx | Hook | Adicionar `description` na interface e mutacoes |
| useRecipeCategories.tsx | Hook | Adicionar `description` |
| useDecorationCategories.tsx | Hook | Adicionar `description` |
| usePackagingCategories.tsx | Hook | Adicionar `description` |
| useProductCategories.tsx | Hook | Adicionar `description` |
| CategoryForm.tsx | Form | Adicionar textarea para descricao |
| RecipeCategoryForm.tsx | Form | Adicionar textarea para descricao |
| DecorationCategoryForm.tsx | Form | Adicionar textarea para descricao |
| PackagingCategoryForm.tsx | Form | Adicionar textarea para descricao |
| ProductCategoryForm.tsx | Form | Adicionar textarea para descricao |
| CategoriesList.tsx | Lista | Exibir descricao nos cards |
| RecipeCategoriesList.tsx | Lista | Exibir descricao nos cards |
| DecorationCategoriesList.tsx | Lista | Exibir descricao nos cards |
| PackagingCategoriesList.tsx | Lista | Exibir descricao nos cards |
| ProductCategoriesList.tsx | Lista | Exibir descricao nos cards |

---

## Observacoes Importantes

1. **Usuarios existentes**: A migracao nao afeta categorias ja criadas - elas ficarao com descricao vazia (NULL)

2. **Novos usuarios**: Receberao automaticamente todas as novas categorias com descricoes via triggers atualizados

3. **Criacao manual**: Usuarios podem criar novas categorias personalizadas a qualquer momento

4. **Descricao opcional**: O campo descricao nao sera obrigatorio, permitindo categorias simples

5. **Retrocompatibilidade**: Categorias existentes continuam funcionando normalmente
