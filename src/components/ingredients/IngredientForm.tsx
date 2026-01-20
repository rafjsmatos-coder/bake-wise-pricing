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
import { useCategories } from '@/hooks/useCategories';
import { useIngredients, type Ingredient, type CreateIngredientData } from '@/hooks/useIngredients';
import { UNITS, type MeasurementUnit, getCostPerUnit, formatCurrency } from '@/lib/unit-conversion';
import { Loader2, Calculator } from 'lucide-react';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  purchase_price: z.number().positive('Preço deve ser maior que zero'),
  package_quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unit: z.enum(['kg', 'g', 'L', 'ml', 'un'] as const),
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
      setShowOptional(false);
    }
  }, [ingredient, reset, open]);

  const watchPrice = watch('purchase_price');
  const watchQuantity = watch('package_quantity');
  const watchUnit = watch('unit');

  const costInfo = watchPrice > 0 && watchQuantity > 0
    ? getCostPerUnit(watchPrice, watchQuantity, watchUnit)
    : null;

  const onSubmit = async (data: IngredientFormData) => {
    const submitData: CreateIngredientData = {
      name: data.name.trim(),
      purchase_price: data.purchase_price,
      package_quantity: data.package_quantity,
      unit: data.unit,
      category_id: data.category_id || null,
      brand: data.brand?.trim() || null,
      supplier: data.supplier?.trim() || null,
      expiry_date: data.expiry_date || null,
      stock_quantity: data.stock_quantity ?? null,
      min_stock_alert: data.min_stock_alert ?? null,
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Farinha de Trigo"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Preço e Quantidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Preço de Compra (R$) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('purchase_price', { valueAsNumber: true })}
              />
              {errors.purchase_price && (
                <p className="text-sm text-destructive">{errors.purchase_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_quantity">Quantidade *</Label>
              <Input
                id="package_quantity"
                type="number"
                step="0.001"
                min="0"
                placeholder="0"
                {...register('package_quantity', { valueAsNumber: true })}
              />
              {errors.package_quantity && (
                <p className="text-sm text-destructive">{errors.package_quantity.message}</p>
              )}
            </div>
          </div>

          {/* Unidade e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select
                value={watchUnit}
                onValueChange={(value: MeasurementUnit) => setValue('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNITS).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
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
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
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

          {/* Optional Fields Toggle */}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setShowOptional(!showOptional)}
          >
            {showOptional ? 'Ocultar campos opcionais' : 'Mostrar campos opcionais'}
          </Button>

          {showOptional && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Dona Benta"
                    {...register('brand')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    placeholder="Ex: Mercado X"
                    {...register('supplier')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...register('expiry_date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Estoque Atual</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0"
                    {...register('stock_quantity', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_alert">Alerta de Estoque Mínimo</Label>
                <Input
                  id="min_stock_alert"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0"
                  {...register('min_stock_alert', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Você será alertado quando o estoque ficar abaixo deste valor
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
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
