import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCategories } from '@/hooks/useCategories';
import { useIngredients, type Ingredient, type CreateIngredientData } from '@/hooks/useIngredients';
import { UNITS, type MeasurementUnit, getCostPerUnit, formatCurrency, getCompatibleUnits, getBestDisplayUnit, convertUnit } from '@/lib/unit-conversion';
import { PriceHistoryChart } from './PriceHistoryChart';
import { Loader2, Calculator, History, ChevronDown } from 'lucide-react';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  purchase_price: z.number().positive('Preço deve ser maior que zero'),
  package_quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unit: z.enum(['kg', 'g', 'L', 'ml', 'un', 'm', 'cm'] as const),
  category_id: z.string().optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  supplier: z.string().max(100).optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  stock_quantity: z.number().optional().nullable(),
  min_stock_alert: z.number().optional().nullable(),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
}

export function IngredientForm({ open, onOpenChange, ingredient }: IngredientFormProps) {
  const { categories } = useCategories();
  const { createIngredient, updateIngredient } = useIngredients();
  const [showOptional, setShowOptional] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [stockUnit, setStockUnit] = useState<MeasurementUnit>('kg');
  const [alertUnit, setAlertUnit] = useState<MeasurementUnit>('kg');
  const [stockDisplayValue, setStockDisplayValue] = useState<string>('');
  const [alertDisplayValue, setAlertDisplayValue] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      purchase_price: undefined as unknown as number,
      package_quantity: undefined as unknown as number,
      unit: 'kg',
      category_id: null,
      brand: null,
      supplier: null,
      expiry_date: null,
      stock_quantity: null,
      min_stock_alert: null,
    },
  });

  useEffect(() => {
    if (ingredient) {
      const mainUnit = ingredient.unit as MeasurementUnit;
      
      // Determine best display units for stock and alert
      const stockDisplay = getBestDisplayUnit(
        ingredient.stock_quantity ? Number(ingredient.stock_quantity) : null,
        mainUnit
      );
      const alertDisplay = getBestDisplayUnit(
        ingredient.min_stock_alert ? Number(ingredient.min_stock_alert) : null,
        mainUnit
      );

      setStockUnit(stockDisplay.displayUnit);
      setAlertUnit(alertDisplay.displayUnit);
      setStockDisplayValue(stockDisplay.displayValue ? String(stockDisplay.displayValue) : '');
      setAlertDisplayValue(alertDisplay.displayValue ? String(alertDisplay.displayValue) : '');

      reset({
        name: ingredient.name,
        purchase_price: Number(ingredient.purchase_price),
        package_quantity: Number(ingredient.package_quantity),
        unit: ingredient.unit,
        category_id: ingredient.category_id,
        brand: ingredient.brand,
        supplier: ingredient.supplier,
        expiry_date: ingredient.expiry_date,
        stock_quantity: ingredient.stock_quantity ? Number(ingredient.stock_quantity) : null,
        min_stock_alert: ingredient.min_stock_alert ? Number(ingredient.min_stock_alert) : null,
      });
      setShowOptional(!!ingredient.brand || !!ingredient.supplier || !!ingredient.expiry_date || !!ingredient.stock_quantity);
      setShowHistory(false);
    } else {
      reset({
        name: '',
        purchase_price: undefined as unknown as number,
        package_quantity: undefined as unknown as number,
        unit: 'kg',
        category_id: null,
        brand: null,
        supplier: null,
        expiry_date: null,
        stock_quantity: null,
        min_stock_alert: null,
      });
      setStockUnit('kg');
      setAlertUnit('kg');
      setStockDisplayValue('');
      setAlertDisplayValue('');
      setShowOptional(false);
      setShowHistory(false);
    }
  }, [ingredient, reset, open]);

  // When main unit changes, reset stock/alert units to match
  const watchUnit = watch('unit');
  useEffect(() => {
    const compatibleUnits = getCompatibleUnits(watchUnit);
    if (!compatibleUnits.includes(stockUnit)) {
      setStockUnit(watchUnit);
    }
    if (!compatibleUnits.includes(alertUnit)) {
      setAlertUnit(watchUnit);
    }
  }, [watchUnit]);

  const watchPrice = watch('purchase_price');
  const watchQuantity = watch('package_quantity');

  const costInfo = watchPrice > 0 && watchQuantity > 0
    ? getCostPerUnit(watchPrice, watchQuantity, watchUnit)
    : null;

  const compatibleUnits = getCompatibleUnits(watchUnit);
  const showUnitSelector = compatibleUnits.length > 1;

  const onSubmit = async (data: IngredientFormData) => {
    // Convert stock and alert values from display unit to main unit
    let stockInMainUnit: number | null = null;
    let alertInMainUnit: number | null = null;

    const stockVal = stockDisplayValue ? Number(stockDisplayValue) : null;
    if (stockVal != null && stockVal > 0) {
      if (stockUnit === data.unit) {
        stockInMainUnit = stockVal;
      } else {
        stockInMainUnit = convertUnit(stockVal, stockUnit, data.unit);
      }
    }

    const alertVal = alertDisplayValue ? Number(alertDisplayValue) : null;
    if (alertVal != null && alertVal > 0) {
      if (alertUnit === data.unit) {
        alertInMainUnit = alertVal;
      } else {
        alertInMainUnit = convertUnit(alertVal, alertUnit, data.unit);
      }
    }

    const submitData: CreateIngredientData = {
      name: data.name.trim(),
      purchase_price: data.purchase_price,
      package_quantity: data.package_quantity,
      unit: data.unit,
      category_id: data.category_id || null,
      brand: data.brand?.trim() || null,
      supplier: data.supplier?.trim() || null,
      expiry_date: data.expiry_date || null,
      stock_quantity: stockInMainUnit,
      min_stock_alert: alertInMainUnit,
    };

    if (ingredient) {
      await updateIngredient.mutateAsync({ id: ingredient.id, data: submitData });
    } else {
      await createIngredient.mutateAsync(submitData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Farinha de Trigo"
              className="min-h-[44px]"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Preço e Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">
                Preço de Compra (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="min-h-[44px]"
                {...register('purchase_price', { valueAsNumber: true })}
              />
              {errors.purchase_price && (
                <p className="text-sm text-destructive">{errors.purchase_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_quantity">
                Quantidade <span className="text-destructive">*</span>
              </Label>
              <Input
                id="package_quantity"
                type="number"
                step="0.001"
                min="0"
                placeholder="0"
                className="min-h-[44px]"
                {...register('package_quantity', { valueAsNumber: true })}
              />
              {errors.package_quantity && (
                <p className="text-sm text-destructive">{errors.package_quantity.message}</p>
              )}
            </div>
          </div>

          {/* Unidade e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Unidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchUnit}
                onValueChange={(value: MeasurementUnit) => setValue('unit', value)}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh]">
                  {Object.entries(UNITS).map(([key, info]) => (
                    <SelectItem key={key} value={key} className="py-3">
                      {key} - {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch('category_id') || 'none'}
                onValueChange={(value) => setValue('category_id', value === 'none' ? null : value)}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh]">
                  <SelectItem value="none" className="py-3">Sem categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Preview */}
          {costInfo && (
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 text-accent">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">Custo por unidade:</span>
                <span className="font-bold">{costInfo.formatted}</span>
              </div>
            </div>
          )}

          {/* Price History - only show when editing */}
          {ingredient && (
            <Collapsible open={showHistory} onOpenChange={setShowHistory}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <span>Histórico de Preços</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="border border-border rounded-lg p-4">
                  <PriceHistoryChart
                    ingredientId={ingredient.id}
                    ingredientName={ingredient.name}
                    currentPrice={Number(ingredient.purchase_price)}
                    packageQuantity={Number(ingredient.package_quantity)}
                    unit={ingredient.unit}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Optional Fields Toggle */}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground min-h-[44px]"
            onClick={() => setShowOptional(!showOptional)}
          >
            {showOptional ? 'Ocultar campos opcionais' : 'Mostrar campos opcionais'}
          </Button>

          {showOptional && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Dona Benta"
                    className="min-h-[44px]"
                    {...register('brand')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    placeholder="Ex: Mercado X"
                    className="min-h-[44px]"
                    {...register('supplier')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Data de Validade</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  className="min-h-[44px]"
                  {...register('expiry_date')}
                />
              </div>

              {/* Stock Quantity with unit selector */}
              <div className="space-y-2">
                <Label>Estoque Atual</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Opcional"
                    className="min-h-[44px] flex-1"
                    value={stockDisplayValue}
                    onChange={(e) => setStockDisplayValue(e.target.value)}
                  />
                  {showUnitSelector ? (
                    <Select
                      value={stockUnit}
                      onValueChange={(v: MeasurementUnit) => setStockUnit(v)}
                    >
                      <SelectTrigger className="min-h-[44px] w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {compatibleUnits.map((u) => (
                          <SelectItem key={u} value={u} className="py-3">
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="min-h-[44px] w-16 flex items-center justify-center text-sm text-muted-foreground border rounded-md bg-muted/50">
                      {watchUnit}
                    </div>
                  )}
                </div>
              </div>

              {/* Min Stock Alert with unit selector */}
              <div className="space-y-2">
                <Label>Alerta de Estoque Mínimo</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Opcional"
                    className="min-h-[44px] flex-1"
                    value={alertDisplayValue}
                    onChange={(e) => setAlertDisplayValue(e.target.value)}
                  />
                  {showUnitSelector ? (
                    <Select
                      value={alertUnit}
                      onValueChange={(v: MeasurementUnit) => setAlertUnit(v)}
                    >
                      <SelectTrigger className="min-h-[44px] w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {compatibleUnits.map((u) => (
                          <SelectItem key={u} value={u} className="py-3">
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="min-h-[44px] w-16 flex items-center justify-center text-sm text-muted-foreground border rounded-md bg-muted/50">
                      {watchUnit}
                    </div>
                  )}
                </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : ingredient ? (
                'Atualizar'
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}