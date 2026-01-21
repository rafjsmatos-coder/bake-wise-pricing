import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDecorationCategories, type DecorationCategory } from '@/hooks/useDecorationCategories';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const PRESET_COLORS = [
  '#f59e0b', '#ec4899', '#3b82f6', '#22c55e',
  '#a855f7', '#ef4444', '#6366f1', '#78350f',
];

interface DecorationCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: DecorationCategory | null;
}

export function DecorationCategoryForm({ open, onOpenChange, category }: DecorationCategoryFormProps) {
  const { createCategory, updateCategory } = useDecorationCategories();

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
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        color: category.color || '#6366f1',
      });
    } else {
      reset({
        name: '',
        color: '#6366f1',
      });
    }
  }, [category, reset, open]);

  const watchColor = watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    if (category) {
      await updateCategory.mutateAsync({ id: category.id, data: { name: data.name, color: data.color } });
    } else {
      await createCategory.mutateAsync({ name: data.name, color: data.color });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria de Decoração'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Fitas e Laços"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    watchColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
              <Input
                type="color"
                className="w-8 h-8 p-0 border-0 cursor-pointer"
                value={watchColor}
                onChange={(e) => setValue('color', e.target.value)}
              />
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
