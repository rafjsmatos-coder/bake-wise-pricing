import { TourProvider as ReactTourProvider, StepType, useTour } from '@reactour/tour';
import { ReactNode, useCallback, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TourWrapperProps {
  children: ReactNode;
  onSidebarToggle?: (open: boolean) => void;
}

function TourController({ onSidebarToggle }: { onSidebarToggle?: (open: boolean) => void }) {
  const { currentStep, isOpen } = useTour();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen || !isMobile || !onSidebarToggle) return;

    // Steps that need sidebar open: nav items (steps 4-8)
    const sidebarSteps = [4, 5, 6, 7, 8];
    
    if (sidebarSteps.includes(currentStep)) {
      onSidebarToggle(true);
    } else {
      onSidebarToggle(false);
    }
  }, [currentStep, isOpen, isMobile, onSidebarToggle]);

  return null;
}

export function TourWrapper({ children, onSidebarToggle }: TourWrapperProps) {
  const isMobile = useIsMobile();

  const getTourSteps = useCallback((): StepType[] => [
  {
    selector: '[data-tour="welcome"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Bem-vindo ao BakeWise! 🎂</h3>
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
    selector: '[data-tour="quick-actions"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Ações Rápidas ⚡</h3>
        <p>Atalhos para criar novos itens sem precisar navegar pelo menu.</p>
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
        <p className="text-sm text-muted-foreground mt-1">O sistema calcula automaticamente o custo por grama!</p>
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
    selector: '[data-tour="nav-settings"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Configurações ⚙️</h3>
        <p>Defina seus custos operacionais para cálculos mais precisos:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
          <li>Custo da mão de obra por hora</li>
          <li>Custo de gás e energia</li>
          <li>Margem de segurança padrão</li>
        </ul>
      </div>
    ),
  },
  {
    selector: '[data-tour="welcome"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Pronto para começar! 🚀</h3>
        <p>Agora você já sabe o básico. O próximo passo é cadastrar seus primeiros ingredientes.</p>
        <p className="text-sm text-muted-foreground mt-2">Você pode acessar este tour novamente clicando no botão "Tour Guiado" no Dashboard.</p>
      </div>
    ),
    position: 'center',
  },
  ], []);

  return (
    <ReactTourProvider
      steps={getTourSteps()}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: isMobile ? '16px' : '12px',
          padding: isMobile ? '16px' : '20px',
          maxWidth: isMobile ? '280px' : '360px',
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid hsl(var(--border))',
        }),
        maskArea: (base) => ({
          ...base,
          rx: isMobile ? 12 : 8,
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: 'hsl(var(--accent))',
          color: 'hsl(var(--accent-foreground))',
          fontSize: isMobile ? '12px' : '14px',
          padding: isMobile ? '4px 8px' : '4px 10px',
        }),
        controls: (base) => ({
          ...base,
          marginTop: isMobile ? '12px' : '16px',
        }),
        close: (base) => ({
          ...base,
          color: 'hsl(var(--muted-foreground))',
          right: isMobile ? '8px' : '12px',
          top: isMobile ? '8px' : '12px',
        }),
        button: (base) => ({
          ...base,
          fontSize: isMobile ? '13px' : '14px',
          padding: isMobile ? '6px 12px' : '8px 16px',
        }),
      }}
      padding={{
        mask: isMobile ? 4 : 8,
        popover: isMobile ? 8 : 12,
      }}
      onClickMask={({ setIsOpen }) => setIsOpen(false)}
      showBadge={true}
      showCloseButton={true}
      disableInteraction={true}
      scrollSmooth={true}
      disableDotsNavigation={isMobile}
    >
      <TourController onSidebarToggle={onSidebarToggle} />
      {children}
    </ReactTourProvider>
  );
}
