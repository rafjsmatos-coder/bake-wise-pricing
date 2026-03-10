import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRecipeCategories } from '@/hooks/useRecipeCategories';
import { useRecipes, type Recipe, type CreateRecipeData } from '@/hooks/useRecipes';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useIngredients } from '@/hooks/useIngredients';
import { IngredientSelector, type RecipeIngredientItem } from './IngredientSelector';
import { CostBreakdown } from './CostBreakdown';
import { calculateRecipeCost, calculateIngredientCost, type IngredientData } from '@/lib/recipe-cost-calculator';
import { type MeasurementUnit } from '@/lib/unit-conversion';
import { Loader2, Clock, Flame, Settings2, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const recipeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  yield_quantity: z.number().positive('Rendimento deve ser maior que zero'),
  yield_unit: z.string().min(1, 'Unidade de rendimento é obrigatória'),
  prep_time_minutes: z.number().int().positive('Tempo de preparo deve ser maior que zero'),
  oven_time_minutes: z.number().int().optional().nullable(),
  instructions: z.string().max(5000).optional().nullable(),
  safety_margin_percent: z.number().optional().nullable(),
  additional_costs: z.number().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: Recipe | null;
}

const MEASUREMENT_UNITS = [
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'g', label: 'Gramas (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'un', label: 'Unidades (un)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'cm', label: 'Centímetros (cm)' },
];

export function RecipeForm({ open, onOpenChange, recipe }: RecipeFormProps) {
  const { categories } = useRecipeCategories();
  const { createRecipe, updateRecipe } = useRecipes();
  const { settings } = useUserSettings();
  const { ingredients } = useIngredients();
  const [showOptional, setShowOptional] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredientItem[]>([]);
  const [selectedOvenType, setSelectedOvenType] = useState<'gas' | 'electric' | null>(null);

  // Check if user has both oven types configured
  const hasBothOvenTypes = settings?.oven_type === 'both';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      category_id: '',
      yield_quantity: undefined as unknown as number,
      yield_unit: 'un',
      prep_time_minutes: undefined as unknown as number,
      oven_time_minutes: null,
      instructions: null,
      safety_margin_percent: null,
      additional_costs: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (recipe) {
      reset({
        name: recipe.name,
        category_id: recipe.category_id,
        yield_quantity: Number(recipe.yield_quantity),
        yield_unit: recipe.yield_unit,
        prep_time_minutes: recipe.prep_time_minutes,
        oven_time_minutes: recipe.oven_time_minutes,
        instructions: recipe.instructions,
        safety_margin_percent: recipe.safety_margin_percent,
        additional_costs: recipe.additional_costs ? Number(recipe.additional_costs) : null,
        notes: recipe.notes,
      });

      // Load recipe ingredients with proper unit conversion
      if (recipe.recipe_ingredients) {
        const loadedIngredients: RecipeIngredientItem[] = recipe.recipe_ingredients.map(ri => {
          const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
          // Use calculateIngredientCost for proper unit conversion
          const cost = ingredient ? 
            calculateIngredientCost(
              Number(ri.quantity),
              ri.unit,
              Number(ingredient.purchase_price),
              Number(ingredient.package_quantity),
              ingredient.unit
            ) : 0;
          
          return {
            ingredient_id: ri.ingredient_id,
            ingredient: ingredient,
            quantity: Number(ri.quantity),
            unit: ri.unit,
            cost,
          };
        });
        setSelectedIngredients(loadedIngredients);
      }

      setShowOptional(!!recipe.oven_time_minutes || !!recipe.instructions || !!recipe.notes);
      // Load oven type if user has both types
      if (hasBothOvenTypes && (recipe as any).oven_type) {
        setSelectedOvenType((recipe as any).oven_type);
      } else {
        setSelectedOvenType(null);
      }
    } else {
      reset({
        name: '',
        category_id: '',
        yield_quantity: undefined as unknown as number,
        yield_unit: 'un',
        prep_time_minutes: undefined as unknown as number,
        oven_time_minutes: null,
        instructions: null,
        safety_margin_percent: null,
        additional_costs: null,
        notes: null,
      });
      setSelectedIngredients([]);
      setShowOptional(false);
      setSelectedOvenType(null);
    }
  }, [recipe, reset, open, ingredients, hasBothOvenTypes]);

  const watchYieldQuantity = watch('yield_quantity');
  const watchYieldUnit = watch('yield_unit');
  const watchSafetyMargin = watch('safety_margin_percent');
  const watchAdditionalCosts = watch('additional_costs');

  const costBreakdown = useMemo(() => {
    if (selectedIngredients.length === 0) return null;

    const ingredientsData: IngredientData[] = ingredients.map(i => ({
      id: i.id,
      name: i.name,
      purchase_price: Number(i.purchase_price),
      package_quantity: Number(i.package_quantity),
      unit: i.unit,
      cost_per_unit: Number(i.cost_per_unit),
    }));

    const recipeIngredients = selectedIngredients.map(si => ({
      ingredient_id: si.ingredient_id,
      quantity: si.quantity,
      unit: si.unit,
    }));

    const safetyMargin = watchSafetyMargin ?? settings?.default_safety_margin ?? 15;
    const additionalCosts = watchAdditionalCosts ?? 0;

    return calculateRecipeCost(
      recipeIngredients,
      ingredientsData,
      watchYieldQuantity || 1,
      (watchYieldUnit as MeasurementUnit) || 'un',
      safetyMargin,
      additionalCosts
    );
  }, [selectedIngredients, ingredients, watchYieldQuantity, watchYieldUnit, watchSafetyMargin, watchAdditionalCosts, settings]);

  const onSubmit = async (data: RecipeFormData) => {
    if (selectedIngredients.length === 0) {
      return;
    }

    const submitData: CreateRecipeData = {
      name: data.name.trim(),
      category_id: data.category_id,
      yield_quantity: data.yield_quantity,
      yield_unit: data.yield_unit,
      prep_time_minutes: data.prep_time_minutes,
      oven_time_minutes: data.oven_time_minutes || null,
      instructions: data.instructions?.trim() || null,
      safety_margin_percent: data.safety_margin_percent ?? null,
      additional_costs: data.additional_costs ?? 0,
      notes: data.notes?.trim() || null,
      oven_type: hasBothOvenTypes ? selectedOvenType : undefined,
      ingredients: selectedIngredients.map(si => ({
        ingredient_id: si.ingredient_id,
        quantity: si.quantity,
        unit: si.unit,
      })),
    };

    if (recipe) {
      await updateRecipe.mutateAsync({ id: recipe.id, data: submitData });
    } else {
      await createRecipe.mutateAsync(submitData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {recipe ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Receita <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Bolo de Chocolate"
              className="min-h-[44px]"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('category_id')}
              onValueChange={(value) => setValue('category_id', value)}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Selecione uma categoria..." />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          {/* Rendimento e Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield_quantity">
                Rendimento <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="yield_quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1"
                  className="flex-1 min-h-[44px]"
                  {...register('yield_quantity', { valueAsNumber: true })}
                />
                <Select
                  value={watch('yield_unit')}
                  onValueChange={(value) => setValue('yield_unit', value)}
                >
                  <SelectTrigger className="w-32 min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[40vh]">
                    {MEASUREMENT_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value} className="py-3">
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.yield_quantity && (
                <p className="text-sm text-destructive">{errors.yield_quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prep_time_minutes">
                Tempo de Preparo <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="prep_time_minutes"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="30"
                  className="min-h-[44px]"
                  {...register('prep_time_minutes', { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              {errors.prep_time_minutes && (
                <p className="text-sm text-destructive">{errors.prep_time_minutes.message}</p>
              )}
            </div>
          </div>

          {/* Ingredientes */}
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
              linkedIds={recipe ? recipe.recipe_ingredients?.map(ri => ri.ingredient_id) : undefined}
            />
          {selectedIngredients.length === 0 && (
            <p className="text-sm text-destructive">Adicione pelo menos um ingrediente</p>
          )}

          {/* Cost Preview */}
          {costBreakdown && (
            <CostBreakdown breakdown={costBreakdown} />
          )}

          {/* Optional Fields Toggle */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between min-h-[44px] border-dashed text-muted-foreground"
            onClick={() => setShowOptional(!showOptional)}
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Campos opcionais
            </span>
            {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showOptional && (
            <div className="space-y-4 animate-fade-in">
              {/* Tempo de Forno */}
              <div className="space-y-2">
                <Label htmlFor="oven_time_minutes">Tempo de Forno</Label>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <Input
                    id="oven_time_minutes"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="45"
                    className="min-h-[44px]"
                    {...register('oven_time_minutes', { 
                      setValueAs: (v) => v === '' || v === null || v === undefined ? null : Number(v)
                    })}
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </div>

              {/* Tipo de Forno - só aparece se o usuário tem os dois tipos */}
              {hasBothOvenTypes && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Tipo de Forno para esta receita</Label>
                  <RadioGroup
                    value={selectedOvenType || settings?.default_oven_type || 'gas'}
                    onValueChange={(value) => setSelectedOvenType(value as 'gas' | 'electric')}
                    className="flex gap-4"
                  >
                    <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                      <RadioGroupItem value="gas" id="recipe-oven-gas" />
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Gás</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                      <RadioGroupItem value="electric" id="recipe-oven-electric" />
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Elétrico</span>
                    </label>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Padrão: {settings?.default_oven_type === 'electric' ? 'Elétrico' : 'Gás'}
                  </p>
                </div>
              )}

              {/* Margem e Custos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="safety_margin_percent">Margem de Segurança (%)</Label>
                  <Input
                    id="safety_margin_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={`${settings?.default_safety_margin ?? 15}`}
                    className="min-h-[44px]"
                    {...register('safety_margin_percent', { 
                      setValueAs: (v) => v === '' || v === null || v === undefined ? null : Number(v)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_costs">Custos Adicionais (R$)</Label>
                  <Input
                    id="additional_costs"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="min-h-[44px]"
                    {...register('additional_costs', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Modo de Preparo */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Modo de Preparo</Label>
                <Textarea
                  id="instructions"
                  placeholder={"Misture os ingredientes secos\nAdicione os líquidos\nLeve ao forno por 30 min"}
                  rows={4}
                  {...register('instructions')}
                />
                <p className="text-xs text-muted-foreground">
                  Cada linha será exibida como um passo numerado (1, 2, 3...)
                </p>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Anotações adicionais..."
                  rows={2}
                  {...register('notes')}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-[44px]"
              disabled={isSubmitting || selectedIngredients.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : recipe ? (
                'Atualizar'
              ) : (
                'Criar Receita'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
