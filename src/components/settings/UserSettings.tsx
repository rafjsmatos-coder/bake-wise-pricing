import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Loader2, Settings, Percent, Flame, Zap, Save, User } from 'lucide-react';

const settingsSchema = z.object({
  default_safety_margin: z.number().min(0).max(100),
  include_gas_cost: z.boolean(),
  gas_cost_per_hour: z.number().min(0),
  include_energy_cost: z.boolean(),
  energy_cost_per_hour: z.number().min(0),
  include_labor_cost: z.boolean(),
  labor_cost_per_hour: z.number().min(0),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

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
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize os valores padrão para suas receitas
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        {/* Safety Margin */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Percent className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">Margem de Segurança</h2>
              <p className="text-sm text-muted-foreground">
                Percentual adicionado ao custo dos ingredientes
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_safety_margin">Margem padrão (%)</Label>
            <Input
              id="default_safety_margin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              {...register('default_safety_margin', { valueAsNumber: true })}
            />
            {errors.default_safety_margin && (
              <p className="text-sm text-destructive">
                {errors.default_safety_margin.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Cobre desperdícios, variações de peso e imprevistos
            </p>
          </div>
        </div>

        {/* Gas Cost */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-semibold">Custo de Gás</h2>
                <p className="text-sm text-muted-foreground">
                  Adicionar custo de gás ao cálculo
                </p>
              </div>
            </div>
            <Switch
              checked={includeGasCost}
              onCheckedChange={(checked) => setValue('include_gas_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeGasCost && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="gas_cost_per_hour">Custo por hora (R$)</Label>
              <Input
                id="gas_cost_per_hour"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('gas_cost_per_hour', { valueAsNumber: true })}
              />
              {errors.gas_cost_per_hour && (
                <p className="text-sm text-destructive">
                  {errors.gas_cost_per_hour.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                O custo será calculado com base no tempo de forno da receita
              </p>
            </div>
          )}
        </div>

        {/* Energy Cost */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold">Custo de Energia</h2>
                <p className="text-sm text-muted-foreground">
                  Adicionar custo de energia ao cálculo
                </p>
              </div>
            </div>
            <Switch
              checked={includeEnergyCost}
              onCheckedChange={(checked) => setValue('include_energy_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeEnergyCost && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="energy_cost_per_hour">Custo por hora (R$)</Label>
              <Input
                id="energy_cost_per_hour"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('energy_cost_per_hour', { valueAsNumber: true })}
              />
              {errors.energy_cost_per_hour && (
                <p className="text-sm text-destructive">
                  {errors.energy_cost_per_hour.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Considere o consumo médio de batedeira, geladeira, etc.
              </p>
            </div>
          )}
        </div>

        {/* Labor Cost */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-semibold">Custo de Mão de Obra</h2>
                <p className="text-sm text-muted-foreground">
                  Adicionar custo de mão de obra ao cálculo
                </p>
              </div>
            </div>
            <Switch
              checked={includeLaborCost}
              onCheckedChange={(checked) => setValue('include_labor_cost', checked, { shouldDirty: true })}
            />
          </div>

          {includeLaborCost && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="labor_cost_per_hour">Custo por hora (R$)</Label>
              <Input
                id="labor_cost_per_hour"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('labor_cost_per_hour', { valueAsNumber: true })}
              />
              {errors.labor_cost_per_hour && (
                <p className="text-sm text-destructive">
                  {errors.labor_cost_per_hour.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                O custo será calculado com base no tempo de preparo (trabalho ativo)
              </p>
            </div>
          )}
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
