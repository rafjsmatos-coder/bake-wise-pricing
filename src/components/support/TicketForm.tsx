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
import { ArrowLeft, Headphones, Loader2 } from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';

const ticketSchema = z.object({
  subject: z.string().min(5, 'O assunto deve ter pelo menos 5 caracteres').max(100, 'O assunto deve ter no máximo 100 caracteres'),
  message: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres').max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TicketForm({ onSuccess, onCancel }: TicketFormProps) {
  const { createTicket } = useSupport();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      await createTicket({
        type: 'support',
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
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Novo Ticket de Suporte</CardTitle>
              <CardDescription>
                Descreva seu problema e nossa equipe responderá em breve
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
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Erro ao calcular custo da receita"
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
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descreva em detalhes o problema que você está enfrentando..."
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
                  Enviar Ticket
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
