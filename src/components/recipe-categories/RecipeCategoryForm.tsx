import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRecipeCategories, type RecipeCategory } from '@/hooks/useRecipeCategories';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface RecipeCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: RecipeCategory | null;
}

const DEFAULT_COLORS = [
  '#f59e0b', '#ec4899', '#3b82f6', '#22c55e', 
  '#78350f', '#a855f7', '#ef4444', '#6366f1',
  '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4',
];

export function RecipeCategoryForm({ open, onOpenChange, category }: RecipeCategoryFormProps) {
  const { createCategory, updateCategory } = useRecipeCategories();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: '#6366f1',
      description: '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        color: category.color || '#6366f1',
        description: category.description || '',
      });
    } else {
      reset({
        name: '',
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        description: '',
      });
    }
  }, [category, reset, open]);

  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    if (category) {
      await updateCategory.mutateAsync({ 
        id: category.id, 
        data: { 
          name: data.name.trim(), 
          color: data.color,
          description: data.description?.trim() || null,
        } 
      });
    } else {
      await createCategory.mutateAsync({ 
        name: data.name.trim(), 
        color: data.color,
        description: data.description?.trim() || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria de Receita' : 'Nova Categoria de Receita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Bolos"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Receitas completas de bolos simples ou decorados."
              className="resize-none"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-accent' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                {...register('color')}
                className="w-12 h-8 p-0 border-0"
              />
              <span className="text-sm text-muted-foreground">
                Ou escolha uma cor personalizada
              </span>
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

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
              ) : category ? (
                'Atualizar'
              ) : (
                'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}