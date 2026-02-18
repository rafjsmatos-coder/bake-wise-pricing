import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FAQItem, FAQCategory } from '@/hooks/useFAQ';

interface FAQItemFormProps {
  item?: FAQItem | null;
  categories: FAQCategory[];
  defaultCategoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FAQItemForm({ item, categories, defaultCategoryId, onSuccess, onCancel }: FAQItemFormProps) {
  
  const [question, setQuestion] = useState(item?.question || '');
  const [answer, setAnswer] = useState(item?.answer || '');
  const [categoryId, setCategoryId] = useState(item?.category_id || defaultCategoryId || '');
  const [isPublished, setIsPublished] = useState(item?.is_published ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !categoryId) return;

    setIsSubmitting(true);
    try {
      if (item) {
        const { error } = await supabase
          .from('faq_items')
          .update({
            question: question.trim(),
            answer: answer.trim(),
            category_id: categoryId,
            is_published: isPublished,
          })
          .eq('id', item.id);
        if (error) throw error;
        toast.success('Pergunta atualizada!');
      } else {
        const { data: maxOrder } = await supabase
          .from('faq_items')
          .select('display_order')
          .eq('category_id', categoryId)
          .order('display_order', { ascending: false })
          .limit(1)
          .single();

        const { error } = await supabase
          .from('faq_items')
          .insert({
            question: question.trim(),
            answer: answer.trim(),
            category_id: categoryId,
            is_published: isPublished,
            display_order: (maxOrder?.display_order || 0) + 1,
          });
        if (error) throw error;
        toast.success('Pergunta criada!');
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
        <Label>Categoria</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Pergunta</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: Como cadastro um ingrediente?" required />
      </div>
      <div className="space-y-2">
        <Label>Resposta</Label>
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escreva a resposta detalhada..." rows={5} required />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        <Label>Publicado</Label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {item ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
