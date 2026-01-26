import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';

const suggestionSchema = z.object({
  subject: z.string().min(5, 'O título deve ter pelo menos 5 caracteres').max(100, 'O título deve ter no máximo 100 caracteres'),
  message: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres').max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

interface SuggestionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SuggestionForm({ onSuccess, onCancel }: SuggestionFormProps) {
  const { createTicket } = useSupport();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: SuggestionFormValues) => {
    setIsSubmitting(true);
    try {
      await createTicket({
        type: 'suggestion',
        subject: values.subject,
        message: values.message,
      });
      onSuccess();
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>Nova Sugestão</CardTitle>
              <CardDescription>
                Compartilhe suas ideias para melhorar o PreciBake
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Sugestão</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Adicionar exportação para PDF"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Explique sua sugestão em detalhes, como ela funcionaria e como ajudaria você..."
                        rows={6}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar Sugestão
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
