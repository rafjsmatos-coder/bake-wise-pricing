-- Adicionar coluna description em todas as tabelas de categorias
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.recipe_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.decoration_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.packaging_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Atualizar função de criação de categorias padrão de INGREDIENTES
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.categories (user_id, name, color, description) VALUES
    (NEW.user_id, 'Açúcares', '#ec4899', 'Açúcar refinado, cristal, de confeiteiro, mascavo, demerara, etc.'),
    (NEW.user_id, 'Castanhas', '#78350f', 'Nozes, amêndoas, castanha-do-pará, castanha de caju, pistache, etc.'),
    (NEW.user_id, 'Chocolates', '#7c2d12', 'Chocolate em barra, gotas, cobertura fracionada, cacau em pó, etc.'),
    (NEW.user_id, 'Condimentos', '#b45309', 'Canela, noz-moscada, cravo, pimenta, especiarias em geral.'),
    (NEW.user_id, 'Essências', '#a855f7', 'Extratos e essências aromáticas como baunilha, amêndoa, laranja, etc.'),
    (NEW.user_id, 'Farinhas', '#f59e0b', 'Farinha de trigo, de amêndoas, de arroz, integral, sem glúten, etc.'),
    (NEW.user_id, 'Frutas', '#22c55e', 'Frutas frescas, secas, cristalizadas ou em calda.'),
    (NEW.user_id, 'Laticínios', '#3b82f6', 'Leite, creme de leite, leite condensado, manteiga, iogurte, etc.'),
    (NEW.user_id, 'Leguminosas', '#84cc16', 'Feijão, grão-de-bico, lentilha - usados em receitas especiais ou funcionais.'),
    (NEW.user_id, 'Ovos', '#eab308', 'Ovos inteiros, claras, gemas, ovos pasteurizados.'),
    (NEW.user_id, 'Fermentos e Bicarbonatos', '#14b8a6', 'Fermento químico, biológico, bicarbonato de sódio.'),
    (NEW.user_id, 'Gorduras e Óleos', '#fbbf24', 'Manteiga, margarina, óleo vegetal, gordura hidrogenada.'),
    (NEW.user_id, 'Corantes e Decorativos', '#f472b6', 'Corantes em gel, pó, confeitos, granulados, glitters comestíveis.'),
    (NEW.user_id, 'Emulsificantes e Estabilizantes', '#06b6d4', 'Gelatina, liga neutra, CMC, glicerina.'),
    (NEW.user_id, 'Bebidas e Líquidos', '#0ea5e9', 'Água, leite vegetal, sucos, café, bebidas alcoólicas.'),
    (NEW.user_id, 'Produtos Industrializados', '#64748b', 'Leite condensado, creme de leite, chantilly pronto.'),
    (NEW.user_id, 'Grãos e Cereais', '#a3e635', 'Aveia, linhaça, chia, flocos de arroz.'),
    (NEW.user_id, 'Sal e Realçadores de Sabor', '#94a3b8', 'Sal refinado, flor de sal, glutamato monossódico.'),
    (NEW.user_id, 'Produtos Diet/Light', '#10b981', 'Adoçantes, leite zero lactose, creme vegetal.'),
    (NEW.user_id, 'Ingredientes Sazonais', '#f97316', 'Frutas cristalizadas, especiarias natalinas.'),
    (NEW.user_id, 'Outros', '#6b7280', 'Ingredientes diversos que não se encaixam nas categorias principais.');
  RETURN NEW;
END;
$function$;

-- Atualizar função de criação de categorias padrão de RECEITAS
CREATE OR REPLACE FUNCTION public.create_default_recipe_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.recipe_categories (user_id, name, color, description) VALUES
    (NEW.user_id, 'Bolos', '#f59e0b', 'Receitas completas de bolos simples ou decorados.'),
    (NEW.user_id, 'Caldas e Xaropes', '#fbbf24', 'Preparos líquidos para umedecer bolos ou finalizar sobremesas.'),
    (NEW.user_id, 'Coberturas e Glacês', '#ec4899', 'Camadas externas para bolos e cupcakes, como chantilly, buttercream, etc.'),
    (NEW.user_id, 'Cremes e Mousses', '#f472b6', 'Recheios leves e aerados para tortas, bolos e copinhos.'),
    (NEW.user_id, 'Ganaches', '#78350f', 'Misturas de chocolate com creme de leite para coberturas e recheios.'),
    (NEW.user_id, 'Massas de Bolo', '#d97706', 'Bases de bolos em diferentes sabores e texturas.'),
    (NEW.user_id, 'Massas Folhadas', '#a3e635', 'Receitas de massa crocante para mil-folhas, folhados e tortinhas.'),
    (NEW.user_id, 'Recheios', '#3b82f6', 'Preparos densos ou cremosos para rechear bolos, doces e tortas.'),
    (NEW.user_id, 'Doces Tradicionais', '#22c55e', 'Brigadeiro, beijinho, cajuzinho, etc.'),
    (NEW.user_id, 'Doces Finos', '#a855f7', 'Trufas, camafeus, bombons sofisticados.'),
    (NEW.user_id, 'Biscoitos e Cookies', '#eab308', 'Receitas base para produtos crocantes.'),
    (NEW.user_id, 'Cupcakes', '#f87171', 'Massas e coberturas específicas.'),
    (NEW.user_id, 'Tortas Doces', '#ef4444', 'Torta de limão, morango, chocolate.'),
    (NEW.user_id, 'Sobremesas Geladas', '#06b6d4', 'Pavê, mousse, gelatina, sorvete artesanal.'),
    (NEW.user_id, 'Bolos no Pote', '#fb923c', 'Receitas adaptadas para porções individuais.'),
    (NEW.user_id, 'Pães Doces', '#b45309', 'Sonhos, roscas, cinnamon rolls.'),
    (NEW.user_id, 'Produtos Sazonais', '#f97316', 'Panetone, ovos de Páscoa, doces juninos.'),
    (NEW.user_id, 'Doces no Pote', '#14b8a6', 'Brigadeiro de colher, pudim, mousse no pote.'),
    (NEW.user_id, 'Linha Fit/Diet/Low Carb', '#10b981', 'Receitas com restrições ou foco em saúde.'),
    (NEW.user_id, 'Decoração com Pasta Americana', '#8b5cf6', 'Técnicas e receitas específicas.'),
    (NEW.user_id, 'Caixas Presenteáveis', '#c084fc', 'Receitas combinadas para kits e boxes.'),
    (NEW.user_id, 'Doces Regionais', '#84cc16', 'Cocada, quindim, pé de moleque.'),
    (NEW.user_id, 'Outros', '#6b7280', 'Receitas diversas que não se encaixam nas categorias principais.');
  RETURN NEW;
END;
$function$;

-- Atualizar função de criação de categorias padrão de DECORAÇÕES
CREATE OR REPLACE FUNCTION public.create_default_decoration_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.decoration_categories (user_id, name, color, description) VALUES
    (NEW.user_id, 'Confeitos e Granulados', '#22c55e', 'Miçangas, bolinhas, flocos e granulados para decorar doces e bolos.'),
    (NEW.user_id, 'Corantes', '#ef4444', 'Corantes em gel, líquido ou pó para colorir massas, coberturas e decorações.'),
    (NEW.user_id, 'Fitas e Laços', '#f59e0b', 'Elementos decorativos externos para caixas, potes e kits presenteáveis.'),
    (NEW.user_id, 'Flores e Folhagens', '#ec4899', 'Flores artificiais, naturais ou comestíveis para acabamento delicado.'),
    (NEW.user_id, 'Papéis Comestíveis', '#a855f7', 'Papel arroz, transfer e folhas decorativas comestíveis para bolos e doces.'),
    (NEW.user_id, 'Pasta Americana', '#8b5cf6', 'Massa modelável usada para cobrir bolos ou criar figuras decorativas.'),
    (NEW.user_id, 'Toppers', '#3b82f6', 'Plaquinhas, miniaturas e enfeites posicionados sobre bolos e cupcakes.'),
    (NEW.user_id, 'Floquinhos e Glitter Comestível', '#fbbf24', 'Brilho e textura para doces e bolos.'),
    (NEW.user_id, 'Modelagens em Pasta', '#c084fc', 'Personagens, flores, toppers moldados à mão.'),
    (NEW.user_id, 'Stencil e Texturizadores', '#64748b', 'Usados com glacê ou aerógrafo para criar padrões.'),
    (NEW.user_id, 'Aerógrafos e Tintas Alimentares', '#0ea5e9', 'Pintura direta sobre bolos e doces.'),
    (NEW.user_id, 'Papel Arroz e Transfer', '#f472b6', 'Imagens comestíveis para aplicação em bolos.'),
    (NEW.user_id, 'Decorações Temáticas', '#f97316', 'Itens para datas comemorativas (Natal, Páscoa, Halloween).'),
    (NEW.user_id, 'Decorações Infantis', '#fb923c', 'Personagens, cores vibrantes, miniaturas lúdicas.'),
    (NEW.user_id, 'Decorações Naturais', '#84cc16', 'Frutas, flores naturais comestíveis, folhas.'),
    (NEW.user_id, 'Decorações Personalizadas', '#14b8a6', 'Nomes, frases, iniciais, toppers sob medida.'),
    (NEW.user_id, 'Apliques de Chocolate', '#78350f', 'Moldes e figuras feitas com chocolate.'),
    (NEW.user_id, 'Decorações Fit/Diet', '#10b981', 'Sem açúcar, com ingredientes saudáveis e visuais leves.'),
    (NEW.user_id, 'Miniaturas e Figuras 3D', '#06b6d4', 'Peças decorativas em pasta ou isopor para destaque.'),
    (NEW.user_id, 'Outros', '#6b7280', 'Itens decorativos diversos que não se encaixam nas categorias principais.');
  RETURN NEW;
END;
$function$;

-- Atualizar função de criação de categorias padrão de EMBALAGENS
CREATE OR REPLACE FUNCTION public.create_default_packaging_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.packaging_categories (user_id, name, color, description) VALUES
    (NEW.user_id, 'Caixas', '#f59e0b', 'Embalagens estruturadas para bolos, doces e kits, com ou sem visor transparente.'),
    (NEW.user_id, 'Etiquetas', '#a855f7', 'Adesivos para identificação de produtos, ingredientes, validade ou personalização.'),
    (NEW.user_id, 'Fitas para Embalagem', '#ef4444', 'Fitas decorativas para laços, fechamento de caixas e acabamento de kits.'),
    (NEW.user_id, 'Forminhas', '#22c55e', 'Suportes individuais para doces finos, brigadeiros, cupcakes e bombons.'),
    (NEW.user_id, 'Papéis e Celofanes', '#ec4899', 'Material para embrulhar, proteger ou decorar doces e embalagens.'),
    (NEW.user_id, 'Potes e Tampas', '#3b82f6', 'Recipientes plásticos ou acrílicos para sobremesas no pote, cremes e mousses.'),
    (NEW.user_id, 'Sacos e Sacolas', '#fbbf24', 'Embalagens flexíveis para transporte, entrega ou agrupamento de produtos.'),
    (NEW.user_id, 'Bandejas e Bases', '#78350f', 'Para bolos, tortas, doces finos.'),
    (NEW.user_id, 'Caixas Presenteáveis', '#c084fc', 'Com visor, decoradas, para combos e kits.'),
    (NEW.user_id, 'Embalagens Térmicas', '#64748b', 'Isopor, alumínio, mantas térmicas.'),
    (NEW.user_id, 'Embalagens Personalizadas', '#8b5cf6', 'Com nome, logo, tema de festa.'),
    (NEW.user_id, 'Embalagens Sustentáveis', '#84cc16', 'Papel kraft, biodegradáveis, recicláveis.'),
    (NEW.user_id, 'Embalagens para Doces no Pote', '#14b8a6', 'Potes específicos com tampa, etiquetas.'),
    (NEW.user_id, 'Embalagens para Cupcakes', '#f87171', 'Individuais, múltiplas, com suporte.'),
    (NEW.user_id, 'Embalagens para Brownies e Cookies', '#b45309', 'Saquinhos, caixinhas, envelopes.'),
    (NEW.user_id, 'Embalagens para Sobremesas Geladas', '#06b6d4', 'Potes vedados, resistentes à temperatura.'),
    (NEW.user_id, 'Embalagens para Produtos Sazonais', '#f97316', 'Páscoa, Natal, Dia das Mães, etc.'),
    (NEW.user_id, 'Embalagens Fit/Diet', '#10b981', 'Com visual leve, clean, voltadas para público saudável.'),
    (NEW.user_id, 'Embalagens Infantis', '#fb923c', 'Coloridas, com personagens, para festas de criança.'),
    (NEW.user_id, 'Outros', '#6b7280', 'Itens diversos que não se encaixam nas categorias principais.');
  RETURN NEW;
END;
$function$;

-- Atualizar função de criação de categorias padrão de PRODUTOS
CREATE OR REPLACE FUNCTION public.create_default_product_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.product_categories (user_id, name, color, description) VALUES
    (NEW.user_id, 'Bolos Decorados', '#f59e0b', 'Bolos personalizados com decoração elaborada.'),
    (NEW.user_id, 'Cupcakes', '#ec4899', 'Bolinhos individuais decorados.'),
    (NEW.user_id, 'Doces Finos', '#3b82f6', 'Doces sofisticados para eventos.'),
    (NEW.user_id, 'Kits Festa', '#22c55e', 'Combos temáticos para festas.'),
    (NEW.user_id, 'Tortas', '#a855f7', 'Tortas doces e salgadas.'),
    (NEW.user_id, 'Encomendas Especiais', '#ef4444', 'Produtos personalizados sob demanda.'),
    (NEW.user_id, 'Bolos Simples', '#fbbf24', 'Bolos caseiros sem decoração elaborada.'),
    (NEW.user_id, 'Doces Tradicionais', '#84cc16', 'Brigadeiro, beijinho, cajuzinho, etc.'),
    (NEW.user_id, 'Doces no Pote', '#14b8a6', 'Bolo de pote, pudim de pote.'),
    (NEW.user_id, 'Sobremesas Geladas', '#06b6d4', 'Mousse, pavê, sorvetes artesanais.'),
    (NEW.user_id, 'Pães Doces', '#b45309', 'Roscas, sonhos, cinnamon rolls.'),
    (NEW.user_id, 'Linha Infantil', '#fb923c', 'Cake pops, pirulitos de chocolate.'),
    (NEW.user_id, 'Produtos Sazonais', '#f97316', 'Ovos de Páscoa, panetones, doces juninos.'),
    (NEW.user_id, 'Sobremesas Fit/Diet/Low Carb', '#10b981', 'Opções sem açúcar ou com foco em saúde.'),
    (NEW.user_id, 'Caixas Presenteáveis', '#c084fc', 'Combos temáticos, box de doces.'),
    (NEW.user_id, 'Doces Regionais', '#78350f', 'Quindim, cocada, pé de moleque.'),
    (NEW.user_id, 'Recheios e Coberturas', '#8b5cf6', 'Para venda avulsa.'),
    (NEW.user_id, 'Outros', '#6b7280', 'Produtos diversos que não se encaixam nas categorias principais.');
  RETURN NEW;
END;
$function$;