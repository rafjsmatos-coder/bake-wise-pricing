import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Flame,
  Clock
} from 'lucide-react';

interface CostConfigCardProps {
  onNavigate: (page: string) => void;
}

export function CostConfigCard({ onNavigate }: CostConfigCardProps) {
  const { settings, isLoading } = useUserSettings();

  if (isLoading || !settings) {
    return null;
  }

  // Calculate configuration completeness
  const configItems = [
    { 
      label: 'Mão de obra', 
      icon: Clock,
      configured: settings.include_labor_cost && settings.labor_cost_per_hour > 0 
    },
    { 
      label: 'Energia', 
      icon: Zap,
      configured: settings.include_energy_cost && settings.energy_cost_per_hour > 0 
    },
    { 
      label: 'Gás', 
      icon: Flame,
      configured: settings.include_gas_cost && settings.gas_cost_per_hour > 0 
    },
    { 
      label: 'Custo operacional', 
      icon: TrendingUp,
      configured: settings.indirect_operational_cost_percent > 0 
    },
  ];

  const configuredCount = configItems.filter(item => item.configured).length;
  const completionPercent = (configuredCount / configItems.length) * 100;
  const isFullyConfigured = configuredCount === configItems.length;

  // If fully configured, show a simpler success state
  if (isFullyConfigured) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Custos Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Seus custos estão configurados corretamente! Seus preços refletem a realidade do seu negócio.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="min-h-[44px]"
            onClick={() => onNavigate('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Revisar Configurações
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Configure seus Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning message */}
        <div className="p-3 bg-background rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
            ⚠️ Atenção: Você pode estar perdendo dinheiro!
          </p>
          <p className="text-xs text-muted-foreground">
            Sem configurar seus custos reais (mão de obra, energia, gás), o preço calculado pode estar abaixo do necessário para ter lucro.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Configuração</span>
            <span className="font-medium">{configuredCount} de {configItems.length}</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Config items */}
        <div className="grid grid-cols-2 gap-2">
          {configItems.map((item) => (
            <div 
              key={item.label}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                item.configured 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {item.configured ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <item.icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button 
          className="w-full min-h-[44px]"
          onClick={() => onNavigate('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Agora
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Leva apenas 2 minutos para configurar
        </p>
      </CardContent>
    </Card>
  );
}
