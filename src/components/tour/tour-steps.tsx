import { StepType } from '@reactour/tour';

export function getMobileSteps(): StepType[] {
  return [
    {
      selector: '[data-tour="welcome"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Bem-vindo ao PreciBake! 🎂</h3>
          <p>Vamos te mostrar como usar o sistema para precificar seus produtos de forma simples e profissional.</p>
          <p className="text-sm text-muted-foreground mt-2">O fluxo é: Ingredientes → Receitas → Produtos</p>
        </div>
      ),
      position: 'center',
    },
    {
      selector: '[data-tour="summary-cards"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Visão Geral 📊</h3>
          <p>Aqui você vê um resumo de tudo: quantos produtos, receitas, ingredientes, decorações e embalagens você tem cadastrados.</p>
          <p className="text-sm text-muted-foreground mt-2">👉 Deslize para o lado para ver todos os cards. Toque em qualquer um para acessar a lista completa.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="today-deliveries"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Entregas do Dia 🚨</h3>
          <p>Aqui aparecem os pedidos com entrega para hoje — nunca perca um prazo!</p>
          <p className="text-sm text-muted-foreground mt-2">Toque em qualquer pedido para ver os detalhes completos.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="stock-alerts"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Alertas de Estoque ⚠️</h3>
          <p>O sistema avisa quando ingredientes, decorações ou embalagens estão com estoque baixo ou próximos do vencimento.</p>
          <p className="text-sm text-muted-foreground mt-2">Configure o estoque mínimo em cada item para receber alertas.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="bottom-nav"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Navegação 📱</h3>
          <p>Use a barra inferior para acessar as principais funções do sistema rapidamente.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="bottom-products"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Produtos 🛍️</h3>
          <p>Monte seus produtos finais combinando receitas, decorações e embalagens.</p>
          <p className="text-sm text-muted-foreground mt-2">Defina a margem de lucro e veja o preço de venda sugerido!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="bottom-orders"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Pedidos 📋</h3>
          <p>Gerencie seus pedidos com calendário visual. Controle status, datas de entrega e valores.</p>
          <p className="text-sm text-muted-foreground mt-2">Gere lista de compras automática a partir dos pedidos!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="bottom-financial"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Financeiro 💰</h3>
          <p>Controle entradas e saídas, veja relatórios de faturamento e gerencie contas a receber.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="bottom-more"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Menu Mais ⚡</h3>
          <p>Toque em "Mais" para acessar todas as outras funções:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-0.5">
            <li>Ingredientes, Receitas, Decorações, Embalagens</li>
            <li>Clientes e Lista de Compras</li>
            <li>Configurações e Perfil</li>
          </ul>
        </div>
      ),
    },
    {
      selector: '[data-tour="welcome"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Pronto para começar! 🚀</h3>
          <p>Agora você já sabe o básico! Siga este fluxo para começar:</p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-0.5">
            <li>Configure custos operacionais</li>
            <li>Cadastre ingredientes</li>
            <li>Crie receitas</li>
            <li>Monte seus produtos</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-2">Você pode acessar este tour novamente clicando em "Tour Guiado" no Dashboard.</p>
        </div>
      ),
      position: 'center',
    },
  ];
}

export function getDesktopSteps(): StepType[] {
  return [
    {
      selector: '[data-tour="welcome"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Bem-vindo ao PreciBake! 🎂</h3>
          <p>Vamos te mostrar como usar o sistema para precificar seus produtos de forma simples e profissional.</p>
          <p className="text-sm text-muted-foreground mt-2">O fluxo é: Ingredientes → Receitas → Produtos</p>
        </div>
      ),
      position: 'center',
    },
    {
      selector: '[data-tour="summary-cards"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Visão Geral 📊</h3>
          <p>Aqui você vê um resumo de tudo: quantos produtos, receitas, ingredientes, decorações e embalagens você tem cadastrados.</p>
          <p className="text-sm text-muted-foreground mt-2">Clique em qualquer card para acessar a lista completa.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="today-deliveries"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Entregas do Dia 🚨</h3>
          <p>Aqui aparecem os pedidos com entrega para hoje — nunca perca um prazo!</p>
          <p className="text-sm text-muted-foreground mt-2">Os pedidos são destacados em vermelho para chamar sua atenção.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="stock-alerts"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Alertas de Estoque ⚠️</h3>
          <p>O sistema avisa quando ingredientes, decorações ou embalagens estão com estoque baixo ou próximos do vencimento.</p>
          <p className="text-sm text-muted-foreground mt-2">Configure o estoque mínimo em cada item para receber alertas automáticos.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-ingredients"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">1. Ingredientes 🥚</h3>
          <p><strong>Comece por aqui!</strong> Cadastre todos os ingredientes que você usa, com o preço de compra e a quantidade da embalagem.</p>
          <p className="text-sm text-muted-foreground mt-2">Ex: Farinha de trigo - R$ 25,00 por 5kg</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-recipes"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">2. Receitas 📖</h3>
          <p>Crie suas receitas adicionando os ingredientes e as quantidades usadas.</p>
          <p className="text-sm text-muted-foreground mt-2">O sistema soma o custo de cada ingrediente e calcula o custo total da receita!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-products"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">3. Produtos 🛍️</h3>
          <p>Monte seus produtos finais combinando receitas, decorações e embalagens.</p>
          <p className="text-sm text-muted-foreground mt-2">Defina a margem de lucro e veja o preço de venda sugerido!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-decorations"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Decorações ✨</h3>
          <p>Cadastre itens decorativos: fitas, flores, toppers, etc.</p>
          <p className="text-sm text-muted-foreground mt-2">Funciona igual aos ingredientes: preço da embalagem ÷ quantidade.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-packaging"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Embalagens 📦</h3>
          <p>Caixas, sacos, laços - tudo que embala seu produto final.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-orders"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Pedidos 📋</h3>
          <p>Gerencie seus pedidos com calendário visual. Controle status, datas de entrega e valores.</p>
          <p className="text-sm text-muted-foreground mt-2">Gere lista de compras automática a partir dos pedidos selecionados!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-clients"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Clientes 👥</h3>
          <p>Cadastre seus clientes com telefone e endereço. Ao criar pedidos, selecione o cliente e envie orçamentos pelo WhatsApp.</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-financial"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Financeiro 💰</h3>
          <p>Controle entradas e saídas, veja relatórios de faturamento e gerencie contas a receber.</p>
          <p className="text-sm text-muted-foreground mt-2">As receitas de pedidos são registradas automaticamente!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-shopping-list"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Lista de Compras 🛒</h3>
          <p>Selecione pedidos e o sistema calcula automaticamente todos os ingredientes que você precisa comprar.</p>
          <p className="text-sm text-muted-foreground mt-2">Agrupa quantidades por ingrediente — sem esquecer nada!</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="nav-settings"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Configurações ⚙️</h3>
          <p>Defina seus custos operacionais para cálculos mais precisos:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
            <li>Custo da mão de obra por hora</li>
            <li>Custo de gás e energia</li>
            <li>Margem de segurança padrão</li>
            <li>Mensagens de WhatsApp personalizadas</li>
          </ul>
        </div>
      ),
    },
    {
      selector: '[data-tour="welcome"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Pronto para começar! 🚀</h3>
          <p>Agora você já sabe o básico! Siga este fluxo para começar:</p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-0.5">
            <li>Configure custos operacionais em Configurações</li>
            <li>Cadastre seus ingredientes com preços</li>
            <li>Crie receitas usando os ingredientes</li>
            <li>Monte produtos com receitas + decorações + embalagens</li>
            <li>Registre pedidos e acompanhe entregas</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-2">Você pode acessar este tour novamente clicando em "Tour Guiado" no Dashboard.</p>
        </div>
      ),
      position: 'center',
    },
  ];
}
