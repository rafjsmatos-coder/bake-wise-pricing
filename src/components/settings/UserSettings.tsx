import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Loader2, Percent, Flame, Zap, Save, User, HardHat, Info, Lightbulb } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const settingsSchema = z.object({
  default_safety_margin: z.number().min(0).max(100),
  include_gas_cost: z.boolean(),
  gas_cost_per_hour: z.number().min(0),
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
      include_gas_cost: false,
      gas_cost_per_hour: 0,
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
        include_gas_cost: settings.include_gas_cost || false,
        gas_cost_per_hour: Number(settings.gas_cost_per_hour) || 0,
        include_energy_cost: settings.include_energy_cost || false,
        energy_cost_per_hour: Number(settings.energy_cost_per_hour) || 0,
        include_labor_cost: settings.include_labor_cost || false,
        labor_cost_per_hour: Number(settings.labor_cost_per_hour) || 0,
        indirect_operational_cost_percent: Number(settings.indirect_operational_cost_percent) || 8,
      });
    }
  }, [settings, reset]);

  const includeGasCost = watch('include_gas_cost');
  const includeEnergyCost = watch('include_energy_cost');
  const includeLaborCost = watch('include_labor_cost');

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações de Custos</h1>
        <p className="text-muted-foreground">
          Configure os valores que serão aplicados automaticamente no cálculo de suas receitas e produtos.
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
                <h2 className="font-semibold">Perdas e Desperdícios</h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Reduz o risco de prejuízo causado por erros de preparo, ingredientes que sobram, 
                      testes de receita e ajustes durante a produção.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-muted-foreground">
                Percentual sobre os ingredientes para cobrir perdas durante o preparo, ajustes e sobras.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="default_safety_margin">Percentual padrão (%)</Label>
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

        {/* Gas Cost / Gás do Forno */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold">Gás do Forno (R$/h)</h2>
                <p className="text-sm text-muted-foreground">
                  Aplicado apenas se o forno for a gás.
                </p>
              </div>
            </div>
            <Switch
              checked={includeGasCost}
              onCheckedChange={(checked) => setValue('include_gas_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeGasCost && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="gas_cost_per_hour">Valor por hora (R$)</Label>
                <Input
                  id="gas_cost_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2,00"
                  {...register('gas_cost_per_hour', { valueAsNumber: true })}
                />
                {errors.gas_cost_per_hour && (
                  <p className="text-sm text-destructive">
                    {errors.gas_cost_per_hour.message}
                  </p>
                )}
              </div>

              <CalculationExample
                formula="Valor do botijão ÷ horas de uso"
                example="R$ 120 ÷ 60h"
                result="R$ 2,00/h"
              />

              <MarketReference
                items={[
                  { label: 'Valor típico', range: 'R$ 1,50 a R$ 2,50/h' },
                ]}
              />
            </div>
          )}
        </div>

        {/* Energy Cost / Gasto com Energia */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Gasto com Energia</h2>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Ative se seu forno principal for elétrico. O valor será aplicado 
                        automaticamente baseado no tempo de preparo de cada receita.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="text-sm text-muted-foreground">
                  Custo por hora do uso do forno elétrico.
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
                <Label htmlFor="energy_cost_per_hour">Valor por hora (R$)</Label>
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
                formula="Consumo do forno (kWh) × tarifa da energia"
                example="2,0 kWh × R$ 0,90"
                result="R$ 1,80/h"
              />

              <MarketReference
                items={[
                  { label: 'Valor típico', range: 'R$ 1,50 a R$ 2,50/h' },
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
                  <h2 className="font-semibold">Valor da Hora de Trabalho</h2>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Fundamental para quem trabalha sob encomenda. Este valor remunera 
                        seu tempo de preparo e decoração em cada receita e produto.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quanto você quer ganhar por hora trabalhada.
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
                <Label htmlFor="labor_cost_per_hour">Valor por hora (R$)</Label>
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
                <h2 className="font-semibold">Custo Operacional Indireto</h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Aplicado sobre o subtotal do produto para cobrir custos que não são 
                      cadastrados individualmente, como luvas, toucas, produtos de limpeza, 
                      água, e utensílios descartáveis.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-muted-foreground">
                Percentual para cobrir EPIs, limpeza, embalagens auxiliares e consumíveis.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="indirect_operational_cost_percent">Percentual (%)</Label>
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
    </div>
  );
}
