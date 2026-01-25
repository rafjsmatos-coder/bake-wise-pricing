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
import { useDecorationCategories } from '@/hooks/useDecorationCategories';
import { useDecorations, type Decoration, type CreateDecorationData } from '@/hooks/useDecorations';
import { UNITS, type MeasurementUnit, getCostPerUnit, formatCurrency } from '@/lib/unit-conversion';
import { Loader2, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const decorationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  purchase_price: z.number().positive('Preço deve ser maior que zero'),
  package_quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unit: z.enum(['kg', 'g', 'L', 'ml', 'un', 'm', 'cm'] as const),
  category_id: z.string().optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  supplier: z.string().max(100).optional().nullable(),
  stock_quantity: z.number().optional().nullable(),
  min_stock_alert: z.number().optional().nullable(),
});

type DecorationFormData = z.infer<typeof decorationSchema>;

interface DecorationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decoration?: Decoration | null;
}

export function DecorationForm({ open, onOpenChange, decoration }: DecorationFormProps) {
  const { categories } = useDecorationCategories();
  const { createDecoration, updateDecoration } = useDecorations();
  const [showOptional, setShowOptional] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DecorationFormData>({
    resolver: zodResolver(decorationSchema),
    defaultValues: {
      name: '',
      purchase_price: undefined as unknown as number,
      package_quantity: undefined as unknown as number,
      unit: 'un',
      category_id: null,
      brand: null,
      supplier: null,
      stock_quantity: null,
      min_stock_alert: null,
    },
  });

  useEffect(() => {
    if (decoration) {
      reset({
        name: decoration.name,
        purchase_price: Number(decoration.purchase_price),
        package_quantity: Number(decoration.package_quantity),
        unit: decoration.unit,
        category_id: decoration.category_id,
        brand: decoration.brand,
        supplier: decoration.supplier,
        stock_quantity: decoration.stock_quantity ? Number(decoration.stock_quantity) : null,
        min_stock_alert: decoration.min_stock_alert ? Number(decoration.min_stock_alert) : null,
      });
      setShowOptional(!!decoration.brand || !!decoration.supplier || !!decoration.stock_quantity);
    } else {
      reset({
        name: '',
        purchase_price: undefined as unknown as number,
        package_quantity: undefined as unknown as number,
        unit: 'un',
        category_id: null,
        brand: null,
        supplier: null,
        stock_quantity: null,
        min_stock_alert: null,
      });
      setShowOptional(false);
    }
  }, [decoration, reset, open]);

  const watchPrice = watch('purchase_price');
  const watchQuantity = watch('package_quantity');
  const watchUnit = watch('unit');

  const costInfo = watchPrice > 0 && watchQuantity > 0
    ? getCostPerUnit(watchPrice, watchQuantity, watchUnit)
    : null;

  const onSubmit = async (data: DecorationFormData) => {
    const submitData: CreateDecorationData = {
      name: data.name.trim(),
      purchase_price: data.purchase_price,
      package_quantity: data.package_quantity,
      unit: data.unit,
      category_id: data.category_id || null,
      brand: data.brand?.trim() || null,
      supplier: data.supplier?.trim() || null,
      stock_quantity: data.stock_quantity ?? null,
      min_stock_alert: data.min_stock_alert ?? null,
    };

    if (decoration) {
      await updateDecoration.mutateAsync({ id: decoration.id, data: submitData });
    } else {
      await createDecoration.mutateAsync(submitData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {decoration ? 'Editar Decoração' : 'Nova Decoração'}
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
              placeholder="Ex: Fita de Cetim Rosa"
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
            </div>
          </div>

          {/* Preview do custo */}
          {costInfo && (
            <div className="bg-accent/10 rounded-lg p-3 flex items-center gap-3">
              <Calculator className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Custo por unidade</p>
                <p className="text-lg font-bold text-accent">{costInfo.formatted}</p>
              </div>
            </div>
          )}

          {/* Toggle campos opcionais */}
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between min-h-[44px]"
            onClick={() => setShowOptional(!showOptional)}
          >
            <span>Campos opcionais</span>
            {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* Campos opcionais */}
          {showOptional && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Fitas São José"
                    className="min-h-[44px]"
                    {...register('brand')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    placeholder="Ex: Atacado das Fitas"
                    className="min-h-[44px]"
                    {...register('supplier')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Estoque Atual</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="min-h-[44px]"
                    {...register('stock_quantity', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock_alert">Alerta de Estoque Mínimo</Label>
                  <Input
                    id="min_stock_alert"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="min-h-[44px]"
                    {...register('min_stock_alert', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto min-h-[44px]" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto min-h-[44px]" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {decoration ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
