import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, BarChart3, Receipt } from 'lucide-react';
import { TransactionsList } from './TransactionsList';
import { RevenueReport } from './RevenueReport';
import { ReceivablesList } from './ReceivablesList';

type FinancialTab = 'cash-flow' | 'reports' | 'receivables';

interface FinancialPageProps {
  initialTab?: FinancialTab;
}

export function FinancialPage({ initialTab = 'cash-flow' }: FinancialPageProps) {
  const [activeTab, setActiveTab] = useState<FinancialTab>(initialTab);

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialTab)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="cash-flow" className="gap-1.5 text-xs sm:text-sm">
            <DollarSign className="h-3.5 w-3.5 hidden sm:block" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:block" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="receivables" className="gap-1.5 text-xs sm:text-sm">
            <Receipt className="h-3.5 w-3.5 hidden sm:block" />
            A Receber
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cash-flow" className="mt-4">
          <TransactionsList />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <RevenueReport />
        </TabsContent>
        <TabsContent value="receivables" className="mt-4">
          <ReceivablesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
