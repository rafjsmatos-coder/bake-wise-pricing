import { TourProvider as ReactTourProvider } from '@reactour/tour';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getMobileSteps, getDesktopSteps } from './tour-steps';

interface TourWrapperProps {
  children: ReactNode;
  onSidebarToggle?: (open: boolean) => void;
}

export function TourWrapper({ children, onSidebarToggle }: TourWrapperProps) {
  const isMobile = useIsMobile();

  const steps = isMobile ? getMobileSteps() : getDesktopSteps();

  return (
    <ReactTourProvider
      key={isMobile ? 'mobile' : 'desktop'}
      steps={steps}
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
      {children}
    </ReactTourProvider>
  );
}
