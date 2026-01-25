import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SidebarControlContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarControlContext = createContext<SidebarControlContextType | undefined>(undefined);

export function SidebarControlProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <SidebarControlContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarControlContext.Provider>
  );
}

export function useSidebarControl() {
  const context = useContext(SidebarControlContext);
  if (context === undefined) {
    throw new Error('useSidebarControl must be used within a SidebarControlProvider');
  }
  return context;
}
