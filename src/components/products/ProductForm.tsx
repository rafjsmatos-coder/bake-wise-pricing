import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

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
}

interface SelectedRecipe {
  recipe_id: string;
  quantity: number;
  name: string;
}

interface SelectedIngredient {
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  name: string;
}

interface SelectedDecoration {
  decoration_id: string;
  quantity: number;
  unit: MeasurementUnit;
  name: string;
}

interface SelectedPackaging {
  packaging_id: string;
  quantity: number;
  name: string;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();
  const { categories } = useProductCategories();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const { decorations } = useDecorations();
  const { packagingItems } = usePackaging();

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
          name: pr.recipe?.name || '',
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
        recipes: selectedRecipes.map(r => ({ recipe_id: r.recipe_id, quantity: r.quantity })),
        ingredients: selectedIngredients.map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })),
        decorations: selectedDecorations.map(d => ({ decoration_id: d.decoration_id, quantity: d.quantity, unit: d.unit })),
        packaging: selectedPackaging.map(p => ({ packaging_id: p.packaging_id, quantity: p.quantity })),
      };

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
      } else {
        await createProduct.mutateAsync(productData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const addRecipe = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe && !selectedRecipes.find(r => r.recipe_id === recipeId)) {
      setSelectedRecipes([...selectedRecipes, { recipe_id: recipeId, quantity: 1, name: recipe.name }]);
    }
  };

  const addIngredient = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (ingredient && !selectedIngredients.find(i => i.ingredient_id === ingredientId)) {
      setSelectedIngredients([...selectedIngredients, { 
        ingredient_id: ingredientId, 
        quantity: 1, 
        unit: ingredient.unit,
        name: ingredient.name 
      }]);
    }
  };

  const addDecoration = (decorationId: string) => {
    const decoration = decorations.find(d => d.id === decorationId);
    if (decoration && !selectedDecorations.find(d => d.decoration_id === decorationId)) {
      setSelectedDecorations([...selectedDecorations, { 
        decoration_id: decorationId, 
        quantity: 1, 
        unit: decoration.unit,
        name: decoration.name 
      }]);
    }
  };

  const addPackaging = (packagingId: string) => {
    const pkg = packagingItems.find(p => p.id === packagingId);
    if (pkg && !selectedPackaging.find(p => p.packaging_id === packagingId)) {
      setSelectedPackaging([...selectedPackaging, { 
        packaging_id: packagingId, 
        quantity: 1, 
        name: pkg.name 
      }]);
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
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bolo de Chocolate Decorado" {...field} />
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
                    <FormLabel>Categoria</FormLabel>
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
                    <FormLabel>Margem de Lucro (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="30" className="min-h-[44px]" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recipes */}
            <Card>
              <CardHeader className="py-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">Receitas</CardTitle>
                  <Select onValueChange={addRecipe}>
                    <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]">
                      <SelectValue placeholder="Adicionar receita" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {recipes.filter(r => !selectedRecipes.find(sr => sr.recipe_id === r.id)).map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id} className="py-3">
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-6">
                {selectedRecipes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma receita adicionada</p>
                ) : (
                  <div className="space-y-3">
                    {selectedRecipes.map((r, idx) => (
                      <div key={r.recipe_id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="flex-1 text-sm font-medium">{r.name}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20 min-h-[44px]"
                            value={r.quantity}
                            onChange={(e) => {
                              const updated = [...selectedRecipes];
                              updated[idx].quantity = parseFloat(e.target.value) || 1;
                              setSelectedRecipes(updated);
                            }}
                          />
                          <span className="text-sm text-muted-foreground">x</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => setSelectedRecipes(selectedRecipes.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader className="py-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">Ingredientes Avulsos</CardTitle>
                  <Select onValueChange={addIngredient}>
                    <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]">
                      <SelectValue placeholder="Adicionar ingrediente" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {ingredients.filter(i => !selectedIngredients.find(si => si.ingredient_id === i.id)).map((ing) => (
                        <SelectItem key={ing.id} value={ing.id} className="py-3">
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-6">
                {selectedIngredients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum ingrediente adicionado</p>
                ) : (
                  <div className="space-y-3">
                    {selectedIngredients.map((i, idx) => (
                      <div key={i.ingredient_id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="flex-1 text-sm font-medium">{i.name}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 min-h-[44px]"
                            value={i.quantity}
                            onChange={(e) => {
                              const updated = [...selectedIngredients];
                              updated[idx].quantity = parseFloat(e.target.value) || 0;
                              setSelectedIngredients(updated);
                            }}
                          />
                          <Select
                            value={i.unit}
                            onValueChange={(value) => {
                              const updated = [...selectedIngredients];
                              updated[idx].unit = value as MeasurementUnit;
                              setSelectedIngredients(updated);
                            }}
                          >
                            <SelectTrigger className="w-[100px] min-h-[44px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[40vh]">
                              {UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value} className="py-3">
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => setSelectedIngredients(selectedIngredients.filter((_, idx2) => idx2 !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Decorations */}
            <Card>
              <CardHeader className="py-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">Decorações</CardTitle>
                  <Select onValueChange={addDecoration}>
                    <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]">
                      <SelectValue placeholder="Adicionar decoração" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {decorations.filter(d => !selectedDecorations.find(sd => sd.decoration_id === d.id)).map((dec) => (
                        <SelectItem key={dec.id} value={dec.id} className="py-3">
                          {dec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-6">
                {selectedDecorations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma decoração adicionada</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDecorations.map((d, idx) => (
                      <div key={d.decoration_id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="flex-1 text-sm font-medium">{d.name}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 min-h-[44px]"
                            value={d.quantity}
                            onChange={(e) => {
                              const updated = [...selectedDecorations];
                              updated[idx].quantity = parseFloat(e.target.value) || 0;
                              setSelectedDecorations(updated);
                            }}
                          />
                          <Select
                            value={d.unit}
                            onValueChange={(value) => {
                              const updated = [...selectedDecorations];
                              updated[idx].unit = value as MeasurementUnit;
                              setSelectedDecorations(updated);
                            }}
                          >
                            <SelectTrigger className="w-[100px] min-h-[44px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[40vh]">
                              {UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value} className="py-3">
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => setSelectedDecorations(selectedDecorations.filter((_, idx2) => idx2 !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Packaging */}
            <Card>
              <CardHeader className="py-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">Embalagens</CardTitle>
                  <Select onValueChange={addPackaging}>
                    <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]">
                      <SelectValue placeholder="Adicionar embalagem" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {packagingItems.filter(p => !selectedPackaging.find(sp => sp.packaging_id === p.id)).map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id} className="py-3">
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-6">
                {selectedPackaging.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma embalagem adicionada</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPackaging.map((p, idx) => (
                      <div key={p.packaging_id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="flex-1 text-sm font-medium">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="1"
                            className="w-20 min-h-[44px]"
                            value={p.quantity}
                            onChange={(e) => {
                              const updated = [...selectedPackaging];
                              updated[idx].quantity = parseFloat(e.target.value) || 1;
                              setSelectedPackaging(updated);
                            }}
                          />
                          <span className="text-sm text-muted-foreground">un</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => setSelectedPackaging(selectedPackaging.filter((_, idx2) => idx2 !== idx))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="decoration_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Decoração (minutos)</FormLabel>
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
                    <FormLabel>Custos Adicionais (R$)</FormLabel>
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
                  <FormLabel>Observações</FormLabel>
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
