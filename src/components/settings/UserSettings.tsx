import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { NotificationSettings } from './NotificationSettings';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Loader2, Percent, Zap, Save, User, HardHat, Info, Lightbulb } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { OvenCostSection } from './OvenCostSection';

const settingsSchema = z.object({
  default_safety_margin: z.number().min(0).max(100),
  oven_type: z.enum(['gas', 'electric', 'both']),
  include_gas_cost: z.boolean(),
  gas_cost_per_hour: z.number().min(0),
  electric_oven_cost_per_hour: z.number().min(0),
  default_oven_type: z.enum(['gas', 'electric']),
  include_energy_cost: z.boolean(),
  energy_cost_per_hour: z.number().min(0),
  include_labor_cost: z.boolean(),
  labor_cost_per_hour: z.number().min(0),
  indirect_operational_cost_percent: z.number().min(0).max(100),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface MarketReferenceProps {
  items: { label: string; range: string }[];
}

function MarketReference({ items }: MarketReferenceProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Lightbulb className="h-3.5 w-3.5" />
        <span>Referência de mercado:</span>
      </div>
      <div className="grid gap-1">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalculationExampleProps {
  formula: string;
  example: string;
  result: string;
}

function CalculationExample({ formula, example, result }: CalculationExampleProps) {
  return (
    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
        <Info className="h-3.5 w-3.5" />
        <span>Como calcular:</span>
      </div>
      <div className="text-sm space-y-1">
        <p className="text-muted-foreground">{formula}</p>
        <p className="font-mono text-xs bg-background/80 rounded px-2 py-1">
          {example} = <span className="text-accent font-semibold">{result}</span>
        </p>
      </div>
    </div>
  );
}

export function UserSettings() {
  const { settings, isLoading, updateSettings } = useUserSettings();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      default_safety_margin: 15,
      oven_type: 'gas' as const,
      include_gas_cost: false,
      gas_cost_per_hour: 0,
      electric_oven_cost_per_hour: 0,
      default_oven_type: 'gas' as const,
      include_energy_cost: false,
      energy_cost_per_hour: 0,
      include_labor_cost: false,
      labor_cost_per_hour: 0,
      indirect_operational_cost_percent: 8,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        default_safety_margin: Number(settings.default_safety_margin) || 15,
        oven_type: settings.oven_type || 'gas',
        include_gas_cost: settings.include_gas_cost || false,
        gas_cost_per_hour: Number(settings.gas_cost_per_hour) || 0,
        electric_oven_cost_per_hour: Number(settings.electric_oven_cost_per_hour) || 0,
        default_oven_type: settings.default_oven_type || 'gas',
        include_energy_cost: settings.include_energy_cost || false,
        energy_cost_per_hour: Number(settings.energy_cost_per_hour) || 0,
        include_labor_cost: settings.include_labor_cost || false,
        labor_cost_per_hour: Number(settings.labor_cost_per_hour) || 0,
        indirect_operational_cost_percent: Number(settings.indirect_operational_cost_percent) || 8,
      });
    }
  }, [settings, reset]);

  const includeEnergyCost = watch('include_energy_cost');
  const includeLaborCost = watch('include_labor_cost');
  const ovenType = watch('oven_type');
  const gasCostPerHour = watch('gas_cost_per_hour');
  const electricOvenCostPerHour = watch('electric_oven_cost_per_hour');
  const defaultOvenType = watch('default_oven_type');

  const onSubmit = async (data: SettingsFormData) => {
    await updateSettings.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
      <h1 className="text-2xl font-bold text-foreground">Meus Custos</h1>
        <p className="text-muted-foreground">
          Preencha com os valores do seu dia a dia. O sistema usa essas informações para calcular o preço justo dos seus produtos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Safety Margin / Perdas e Desperdícios */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
              <Percent className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Reserva para Imprevistos</h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Uma pequena porcentagem a mais sobre os ingredientes para você não sair no prejuízo 
                      quando algo dá errado: uma receita que não deu certo, um ingrediente que estragou, 
                      sobras que não podem ser reaproveitadas...
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-muted-foreground">
                Um valor a mais sobre os ingredientes para cobrir erros, sobras e ajustes do dia a dia.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="default_safety_margin">Quanto reservar? (%)</Label>
              <Input
                id="default_safety_margin"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="15"
                {...register('default_safety_margin', { valueAsNumber: true })}
              />
              {errors.default_safety_margin && (
                <p className="text-sm text-destructive">
                  {errors.default_safety_margin.message}
                </p>
              )}
            </div>

            <MarketReference
              items={[
                { label: 'Bolos e tortas', range: '10% a 20%' },
                { label: 'Doces finos / confeitaria artística', range: '15% a 30%' },
                { label: 'Brigadeiros e bombons', range: '10% a 15%' },
              ]}
            />
          </div>
        </div>

        {/* Oven Cost Section */}
        <OvenCostSection
          ovenType={ovenType}
          gasCostPerHour={gasCostPerHour}
          electricOvenCostPerHour={electricOvenCostPerHour}
          defaultOvenType={defaultOvenType}
          onOvenTypeChange={(value) => {
            setValue('oven_type', value, { shouldDirty: true });
            // Auto-enable gas cost if selecting gas or both
            if (value === 'gas' || value === 'both') {
              setValue('include_gas_cost', true, { shouldDirty: true });
            }
          }}
          onGasCostChange={(value) => setValue('gas_cost_per_hour', value, { shouldDirty: true })}
          onElectricCostChange={(value) => setValue('electric_oven_cost_per_hour', value, { shouldDirty: true })}
          onDefaultOvenTypeChange={(value) => setValue('default_oven_type', value, { shouldDirty: true })}
          errors={errors}
        />

        {/* Energy Cost / Gasto com Energia */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Gasto com Equipamentos</h2>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Quanto custa usar sua batedeira, mixer, processador e outros equipamentos por hora.
                        O sistema calcula automaticamente com base no tempo de preparo de cada receita (o forno é calculado separadamente).
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="text-sm text-muted-foreground">
                  Batedeira, mixer, processador e outros que usam energia.
                </p>
              </div>
            </div>
            <Switch
              checked={includeEnergyCost}
              onCheckedChange={(checked) => setValue('include_energy_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeEnergyCost && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="energy_cost_per_hour">Quanto gasta por hora? (R$)</Label>
                <Input
                  id="energy_cost_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1,80"
                  {...register('energy_cost_per_hour', { valueAsNumber: true })}
                />
                {errors.energy_cost_per_hour && (
                  <p className="text-sm text-destructive">
                    {errors.energy_cost_per_hour.message}
                  </p>
                )}
              </div>

              <CalculationExample
                formula="Consumo da batedeira (kWh) × tarifa da energia"
                example="0,5 kWh × R$ 0,90"
                result="R$ 0,45/h"
              />

              <MarketReference
                items={[
                  { label: 'Batedeira/mixer doméstico', range: 'R$ 0,30 a R$ 0,60/h' },
                  { label: 'Batedeira planetária', range: 'R$ 0,50 a R$ 1,00/h' },
                ]}
              />
            </div>
          )}
        </div>

        {/* Labor Cost / Valor da Hora de Trabalho */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Seu Tempo Vale Dinheiro</h2>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Cada hora que você passa preparando e decorando tem um valor. 
                        Se você não cobrar pelo seu tempo, acaba trabalhando de graça! 
                        O sistema inclui esse valor no preço dos seus produtos automaticamente.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quanto você quer receber por cada hora trabalhada.
                </p>
              </div>
            </div>
            <Switch
              checked={includeLaborCost}
              onCheckedChange={(checked) => setValue('include_labor_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeLaborCost && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="labor_cost_per_hour">Quanto quer receber por hora? (R$)</Label>
                <Input
                  id="labor_cost_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="12,00"
                  {...register('labor_cost_per_hour', { valueAsNumber: true })}
                />
                {errors.labor_cost_per_hour && (
                  <p className="text-sm text-destructive">
                    {errors.labor_cost_per_hour.message}
                  </p>
                )}
              </div>

              <CalculationExample
                formula="Salário desejado ÷ horas mensais trabalhadas"
                example="R$ 2.400 ÷ 200h"
                result="R$ 12,00/h"
              />

              <MarketReference
                items={[
                  { label: 'Confeitaria caseira', range: 'R$ 10 a R$ 18/h' },
                  { label: 'Confeitaria profissional', range: 'R$ 20 a R$ 35/h' },
                  { label: 'Cake designer premium', range: 'R$ 35 a R$ 60/h' },
                ]}
              />
            </div>
          )}
        </div>

        {/* Indirect Operational Cost / Custo Operacional Indireto */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
              <HardHat className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Outros Gastos do Negócio</h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      São aqueles gastos que você tem todo mês, mas que não entram direto na receita: 
                      conta de luz, água, aluguel, internet, luvas, toucas, produtos de limpeza, 
                      papel toalha, gás de cozinha e outros itens do dia a dia.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-muted-foreground">
                Água, luz, aluguel, internet, limpeza, luvas e outros gastos fixos do dia a dia.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="indirect_operational_cost_percent">Quanto incluir no preço? (%)</Label>
              <Input
                id="indirect_operational_cost_percent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="8"
                {...register('indirect_operational_cost_percent', { valueAsNumber: true })}
              />
              {errors.indirect_operational_cost_percent && (
                <p className="text-sm text-destructive">
                  {errors.indirect_operational_cost_percent.message}
                </p>
              )}
            </div>

            <MarketReference
              items={[
                { label: 'Produção caseira', range: '5% a 8%' },
                { label: 'Confeitaria estruturada', range: '8% a 12%' },
                { label: 'Alta complexidade', range: '12% a 18%' },
              ]}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </form>

      {/* Notification Settings */}
      <NotificationSettings />
    </div>
  );
}
