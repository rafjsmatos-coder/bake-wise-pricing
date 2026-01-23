import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductionMaterials, ProductionMaterial } from '@/hooks/useProductionMaterials';
import { useProductionMaterialCategories } from '@/hooks/useProductionMaterialCategories';

const UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'par', label: 'Par' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'pc', label: 'Pacote (pc)' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  purchase_price: z.coerce.number().positive('Preço deve ser maior que zero'),
  package_quantity: z.coerce.number().positive('Quantidade deve ser maior que zero'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  stock_quantity: z.coerce.number().optional(),
  min_stock_alert: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductionMaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: ProductionMaterial | null;
}

export function ProductionMaterialForm({ open, onOpenChange, material }: ProductionMaterialFormProps) {
  const { createMaterial, updateMaterial } = useProductionMaterials();
  const { categories } = useProductionMaterialCategories();

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
      stock_quantity: undefined,
      min_stock_alert: undefined,
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        name: material.name,
        purchase_price: material.purchase_price,
        package_quantity: material.package_quantity,
        unit: material.unit,
        category_id: material.category_id || '',
        brand: material.brand || '',
        supplier: material.supplier || '',
        stock_quantity: material.stock_quantity ?? undefined,
        min_stock_alert: material.min_stock_alert ?? undefined,
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
        stock_quantity: undefined,
        min_stock_alert: undefined,
      });
    }
  }, [material, form, open]);

  const onSubmit = async (data: FormData) => {
    const formData = {
      name: data.name,
      purchase_price: data.purchase_price,
      package_quantity: data.package_quantity,
      unit: data.unit as ProductionMaterial['unit'],
      category_id: data.category_id || null,
      brand: data.brand || null,
      supplier: data.supplier || null,
      stock_quantity: data.stock_quantity ?? null,
      min_stock_alert: data.min_stock_alert ?? null,
    };

    if (material) {
      await updateMaterial.mutateAsync({ id: material.id, ...formData });
    } else {
      await createMaterial.mutateAsync(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {material ? 'Editar Material' : 'Novo Material de Produção'}
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
                    <Input placeholder="Ex: Luvas descartáveis" {...field} />
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
                    <FormLabel>Preço de compra (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="package_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade na embalagem *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
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
                      <Input placeholder="Opcional" {...field} />
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
                    <FormLabel>Estoque atual</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Opcional" {...field} />
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
                    <FormLabel>Alerta de estoque mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMaterial.isPending || updateMaterial.isPending}
              >
                {material ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
