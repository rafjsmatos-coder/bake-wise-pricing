import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useProducts, Product } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { RecipeSelector, type SelectedRecipe } from './selectors/RecipeSelector';
import { IngredientSelector, type SelectedIngredient } from './selectors/IngredientSelector';
import { DecorationSelector, type SelectedDecoration } from './selectors/DecorationSelector';
import { PackagingSelector, type SelectedPackaging } from './selectors/PackagingSelector';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category_id: z.string().optional(),
  decoration_time_minutes: z.coerce.number().min(0).optional(),
  profit_margin_percent: z.coerce.number().min(0).max(1000).optional(),
  additional_costs: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  recipeCosts?: Record<string, number>;
}

export function ProductForm({ open, onOpenChange, product, recipeCosts = {} }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();
  const { categories } = useProductCategories();

  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedDecorations, setSelectedDecorations] = useState<SelectedDecoration[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<SelectedPackaging[]>([]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category_id: '',
      decoration_time_minutes: undefined,
      profit_margin_percent: undefined,
      additional_costs: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category_id: product.category_id || '',
        decoration_time_minutes: product.decoration_time_minutes ?? undefined,
        profit_margin_percent: product.profit_margin_percent ?? undefined,
        additional_costs: product.additional_costs ?? undefined,
        notes: product.notes || '',
      });

      // Load existing relations
      setSelectedRecipes(
        product.product_recipes?.map(pr => ({
          recipe_id: pr.recipe_id,
          quantity: pr.quantity,
          unit: pr.unit || pr.recipe?.yield_unit || 'un',
          name: pr.recipe?.name || '',
          yield_quantity: pr.recipe?.yield_quantity || 1,
          yield_unit: pr.recipe?.yield_unit || 'un',
        })) || []
      );
      setSelectedIngredients(
        product.product_ingredients?.map(pi => ({
          ingredient_id: pi.ingredient_id,
          quantity: pi.quantity,
          unit: pi.unit,
          name: pi.ingredient?.name || '',
        })) || []
      );
      setSelectedDecorations(
        product.product_decorations?.map(pd => ({
          decoration_id: pd.decoration_id,
          quantity: pd.quantity,
          unit: pd.unit,
          name: pd.decoration?.name || '',
        })) || []
      );
      setSelectedPackaging(
        product.product_packaging?.map(pp => ({
          packaging_id: pp.packaging_id,
          quantity: pp.quantity,
          name: pp.packaging?.name || '',
        })) || []
      );
    } else {
      form.reset({
        name: '',
        category_id: '',
        decoration_time_minutes: undefined,
        profit_margin_percent: undefined,
        additional_costs: undefined,
        notes: '',
      });
      setSelectedRecipes([]);
      setSelectedIngredients([]);
      setSelectedDecorations([]);
      setSelectedPackaging([]);
    }
  }, [product, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const productData = {
        name: data.name,
        category_id: data.category_id || null,
        decoration_time_minutes: data.decoration_time_minutes ?? 0,
        profit_margin_percent: data.profit_margin_percent ?? 30,
        additional_costs: data.additional_costs ?? 0,
        notes: data.notes || null,
        recipes: selectedRecipes.map(r => ({ recipe_id: r.recipe_id, quantity: r.quantity, unit: r.unit })),
        ingredients: selectedIngredients.map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })),
        decorations: selectedDecorations.map(d => ({ decoration_id: d.decoration_id, quantity: d.quantity, unit: d.unit })),
        packaging: selectedPackaging.map(p => ({ packaging_id: p.packaging_id, quantity: p.quantity })),
      };

      const isEditing = !!product;
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
      } else {
        await createProduct.mutateAsync(productData);
      }
      onOpenChange(false);
      setTimeout(() => {
        toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      }, 150);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-[700px] max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-1 sm:col-span-2">
                    <Label htmlFor="name">
                      Nome do Produto <span className="text-destructive">*</span>
                    </Label>
                    <FormControl>
                      <Input placeholder="Ex: Bolo de Chocolate Decorado" className="min-h-[44px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <Label>Categoria</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profit_margin_percent"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="profit_margin_percent">Quanto quer lucrar? (%)</Label>
                    <FormControl>
                      <Input type="number" step="1" placeholder="30" className="min-h-[44px]" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      É o seu ganho real. Ex: com 30%, um produto que custa R$ 50 será sugerido a R$ 65.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recipe Selector */}
            <RecipeSelector
              selectedRecipes={selectedRecipes}
              onRecipesChange={setSelectedRecipes}
              recipeCosts={recipeCosts}
              linkedIds={product ? product.product_recipes?.map(r => r.recipe_id) : undefined}
            />

            {/* Ingredient Selector */}
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
              linkedIds={product ? product.product_ingredients?.map(i => i.ingredient_id) : undefined}
            />

            {/* Decoration Selector */}
            <DecorationSelector
              selectedDecorations={selectedDecorations}
              onDecorationsChange={setSelectedDecorations}
              linkedIds={product ? product.product_decorations?.map(d => d.decoration_id) : undefined}
            />

            {/* Packaging Selector */}
            <PackagingSelector
              selectedPackaging={selectedPackaging}
              onPackagingChange={setSelectedPackaging}
              linkedIds={product ? product.product_packaging?.map(p => p.packaging_id) : undefined}
            />

            {/* Additional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="decoration_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="decoration_time_minutes">Tempo de montagem e decoração (min)</Label>
                    <FormControl>
                      <Input type="number" step="1" placeholder="Ex: 30" className="min-h-[44px]" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_costs"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="additional_costs">Outros Custos (R$)</Label>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 5,00" className="min-h-[44px]" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="notes">Observações</Label>
                  <FormControl>
                    <Textarea placeholder="Anotações sobre o produto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {product ? 'Salvar' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
