import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { useEffect } from 'react';

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
  brand: z.string().optional(),
  supplier: z.string().optional(),
  dimensions: z.string().optional(),
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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      purchase_price: 0,
      package_quantity: 1,
      unit: 'un',
      category_id: '',
      brand: '',
      supplier: '',
      dimensions: '',
      stock_quantity: undefined,
      min_stock_alert: undefined,
    },
  });

  useEffect(() => {
    if (packaging) {
      form.reset({
        name: packaging.name,
        purchase_price: packaging.purchase_price,
        package_quantity: packaging.package_quantity,
        unit: packaging.unit,
        category_id: packaging.category_id || '',
        brand: packaging.brand || '',
        supplier: packaging.supplier || '',
        dimensions: packaging.dimensions || '',
        stock_quantity: packaging.stock_quantity ?? undefined,
        min_stock_alert: packaging.min_stock_alert ?? undefined,
      });
    } else {
      form.reset({
        name: '',
        purchase_price: 0,
        package_quantity: 1,
        unit: 'un',
        category_id: '',
        brand: '',
        supplier: '',
        dimensions: '',
        stock_quantity: undefined,
        min_stock_alert: undefined,
      });
    }
  }, [packaging, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const submitData = {
        name: data.name,
        purchase_price: data.purchase_price,
        package_quantity: data.package_quantity,
        unit: data.unit,
        category_id: data.category_id || null,
        brand: data.brand || null,
        supplier: data.supplier || null,
        dimensions: data.dimensions || null,
        stock_quantity: data.stock_quantity ?? null,
        min_stock_alert: data.min_stock_alert ?? null,
      };

      if (packaging) {
        await updatePackaging.mutateAsync({ id: packaging.id, ...submitData });
      } else {
        await createPackaging.mutateAsync(submitData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar embalagem:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Caixa Kraft 15x15cm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Compra (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
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
                      <FormLabel>Quantidade *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1" 
                          {...field} 
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
                      <FormLabel>Unidade *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
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
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
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

            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensões</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 15x15x10cm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sulformas" {...field} />
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
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Casa das Embalagens" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Opcional" 
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
                name="min_stock_alert"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alerta de Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Opcional" 
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createPackaging.isPending || updatePackaging.isPending}
              >
                {packaging ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
