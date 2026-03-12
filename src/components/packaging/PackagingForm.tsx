import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePackaging, Packaging } from '@/hooks/usePackaging';
import { usePackagingCategories } from '@/hooks/usePackagingCategories';
import { Calculator, ChevronDown, ChevronUp, Loader2, Settings2 } from 'lucide-react';
import { UNITS as UNITS_MAP, type MeasurementUnit, getCostPerUnit, getCompatibleUnits, getBestDisplayUnit, convertUnit } from '@/lib/unit-conversion';

const UNITS = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'Quilograma(s)' },
  { value: 'g', label: 'Grama(s)' },
  { value: 'L', label: 'Litro(s)' },
  { value: 'ml', label: 'Mililitro(s)' },
  { value: 'm', label: 'Metro(s)' },
  { value: 'cm', label: 'Centímetro(s)' },
] as const;

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  purchase_price: z.coerce.number().positive('Preço deve ser positivo'),
  package_quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  unit: z.enum(['un', 'kg', 'g', 'L', 'ml', 'm', 'cm']),
  category_id: z.string().optional(),
  dimensions: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  stock_quantity: z.coerce.number().optional(),
  min_stock_alert: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PackagingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packaging?: Packaging | null;
}

export function PackagingForm({ open, onOpenChange, packaging }: PackagingFormProps) {
  const { createPackaging, updatePackaging } = usePackaging();
  const { categories } = usePackagingCategories();
  const [showOptional, setShowOptional] = useState(false);
  const [stockUnit, setStockUnit] = useState<MeasurementUnit>('un');
  const [alertUnit, setAlertUnit] = useState<MeasurementUnit>('un');
  const [stockDisplayValue, setStockDisplayValue] = useState<string>('');
  const [alertDisplayValue, setAlertDisplayValue] = useState<string>('');
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      purchase_price: undefined,
      package_quantity: undefined,
      unit: 'un',
      category_id: '',
      dimensions: '',
      brand: '',
      supplier: '',
      stock_quantity: undefined,
      min_stock_alert: undefined,
    },
  });

  const watchPrice = form.watch('purchase_price');
  const watchQuantity = form.watch('package_quantity');
  const watchUnit = form.watch('unit');

  const costInfo = watchPrice > 0 && watchQuantity > 0
    ? getCostPerUnit(watchPrice, watchQuantity, watchUnit as MeasurementUnit)
    : null;

  // When main unit changes, reset stock/alert units if incompatible
  useEffect(() => {
    const compatibleUnits = getCompatibleUnits(watchUnit as MeasurementUnit);
    if (!compatibleUnits.includes(stockUnit)) {
      setStockUnit(watchUnit as MeasurementUnit);
    }
    if (!compatibleUnits.includes(alertUnit)) {
      setAlertUnit(watchUnit as MeasurementUnit);
    }
  }, [watchUnit]);

  const compatibleUnits = getCompatibleUnits(watchUnit as MeasurementUnit);
  const showUnitSelector = compatibleUnits.length > 1;

  useEffect(() => {
    if (packaging) {
      const mainUnit = packaging.unit as MeasurementUnit;

      const stockDisplay = getBestDisplayUnit(
        packaging.stock_quantity != null ? Number(packaging.stock_quantity) : null,
        mainUnit
      );
      const alertDisplay = getBestDisplayUnit(
        packaging.min_stock_alert != null ? Number(packaging.min_stock_alert) : null,
        mainUnit
      );

      setStockUnit(stockDisplay.displayUnit);
      setAlertUnit(alertDisplay.displayUnit);
      setStockDisplayValue(stockDisplay.displayValue ? String(stockDisplay.displayValue) : '');
      setAlertDisplayValue(alertDisplay.displayValue ? String(alertDisplay.displayValue) : '');

      form.reset({
        name: packaging.name,
        purchase_price: packaging.purchase_price,
        package_quantity: packaging.package_quantity,
        unit: packaging.unit,
        category_id: packaging.category_id || '',
        dimensions: packaging.dimensions || '',
        brand: packaging.brand || '',
        supplier: packaging.supplier || '',
        stock_quantity: packaging.stock_quantity ?? undefined,
        min_stock_alert: packaging.min_stock_alert ?? undefined,
      });
      setShowOptional(!!packaging.dimensions || !!packaging.brand || !!packaging.supplier || !!packaging.stock_quantity);
    } else {
      form.reset({
        name: '',
        purchase_price: undefined,
        package_quantity: undefined,
        unit: 'un',
        category_id: '',
        dimensions: '',
        brand: '',
        supplier: '',
        stock_quantity: undefined,
        min_stock_alert: undefined,
      });
      setStockUnit('un');
      setAlertUnit('un');
      setStockDisplayValue('');
      setAlertDisplayValue('');
      setShowOptional(false);
    }
  }, [packaging, form, open]);

  const onSubmit = async (data: FormData) => {
    try {
      // Convert stock and alert values from display unit to main unit
      let stockInMainUnit: number | null = null;
      let alertInMainUnit: number | null = null;

      const stockVal = stockDisplayValue ? Number(stockDisplayValue) : null;
      if (stockVal != null && stockVal > 0) {
        stockInMainUnit = stockUnit === (data.unit as MeasurementUnit)
          ? stockVal
          : (convertUnit(stockVal, stockUnit, data.unit as MeasurementUnit) ?? stockVal);
      }

      const alertVal = alertDisplayValue ? Number(alertDisplayValue) : null;
      if (alertVal != null && alertVal > 0) {
        alertInMainUnit = alertUnit === (data.unit as MeasurementUnit)
          ? alertVal
          : (convertUnit(alertVal, alertUnit, data.unit as MeasurementUnit) ?? alertVal);
      }

      const submitData = {
        name: data.name,
        purchase_price: data.purchase_price,
        package_quantity: data.package_quantity,
        unit: data.unit,
        category_id: data.category_id || null,
        dimensions: data.dimensions || null,
        brand: data.brand || null,
        supplier: data.supplier || null,
        stock_quantity: stockInMainUnit,
        min_stock_alert: alertInMainUnit,
      };

      const isEditing = !!packaging;
      if (isEditing) {
        await updatePackaging.mutateAsync({ id: packaging.id, ...submitData });
      } else {
        await createPackaging.mutateAsync(submitData);
      }
      onOpenChange(false);
      form.reset();
      setTimeout(() => {
        toast.success(isEditing ? 'Embalagem atualizada com sucesso!' : 'Embalagem criada com sucesso!');
      }, 150);
    } catch (error) {
      console.error('Erro ao salvar embalagem:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-[600px] max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {packaging ? 'Editar Embalagem' : 'Nova Embalagem'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <FormControl>
                    <Input placeholder="Ex: Caixa Kraft 15x15cm" className="min-h-[44px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="purchase_price">
                      Preço de Compra (R$) <span className="text-destructive">*</span>
                    </Label>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00"
                        className="min-h-[44px]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="package_quantity"
                  render={({ field }) => (
                    <FormItem>
                       <Label htmlFor="package_quantity">
                        Qtd. na embalagem <span className="text-destructive">*</span>
                      </Label>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0"
                          className="min-h-[44px]"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <Label>
                        Unidade <span className="text-destructive">*</span>
                      </Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="min-h-[44px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[40vh]">
                          {UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value} className="py-3">
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <Label>Categoria</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[40vh]">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: category.color || '#6366f1' }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="dimensions">Dimensões</Label>
                      <FormControl>
                        <Input placeholder="Ex: 15x15x10cm" className="min-h-[44px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="brand">Marca</Label>
                        <FormControl>
                          <Input placeholder="Ex: Sulformas" className="min-h-[44px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="supplier">Fornecedor</Label>
                        <FormControl>
                          <Input placeholder="Ex: Casa das Embalagens" className="min-h-[44px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto min-h-[44px]"
                disabled={createPackaging.isPending || updatePackaging.isPending}
              >
                {(createPackaging.isPending || updatePackaging.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {packaging ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
