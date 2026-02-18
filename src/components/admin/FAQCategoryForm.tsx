import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FAQCategory } from '@/hooks/useFAQ';

interface FAQCategoryFormProps {
  category?: FAQCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FAQCategoryForm({ category, onSuccess, onCancel }: FAQCategoryFormProps) {
  
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '📋');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (category) {
        const { error } = await supabase
          .from('faq_categories')
          .update({ name: name.trim(), icon })
          .eq('id', category.id);
        if (error) throw error;
        toast.success('Categoria atualizada!');
      } else {
        // Get max display_order
        const { data: maxOrder } = await supabase
          .from('faq_categories')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .single();

        const { error } = await supabase
          .from('faq_categories')
          .insert({
            name: name.trim(),
            icon,
            display_order: (maxOrder?.display_order || 0) + 1,
          });
        if (error) throw error;
        toast.success('Categoria criada!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome da Categoria</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Primeiros Passos" required />
      </div>
      <div className="space-y-2">
        <Label>Ícone (emoji)</Label>
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📋" className="w-20" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {category ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
