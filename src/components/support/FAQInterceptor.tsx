import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFAQ } from '@/hooks/useFAQ';

interface FAQInterceptorProps {
  onProceedToTicket: () => void;
  onCancel: () => void;
}

export function FAQInterceptor({ onProceedToTicket, onCancel }: FAQInterceptorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchItems, items, isLoading } = useFAQ();

  // If no FAQs exist, skip directly to ticket
  if (!isLoading && items.length === 0) {
    onProceedToTicket();
    return null;
  }

  const results = searchQuery.trim() ? searchItems(searchQuery) : items.slice(0, 5);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h2 className="text-xl font-bold">Antes de abrir um ticket</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Veja se sua dúvida já foi respondida no nosso FAQ
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Descreva seu problema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          autoComplete="off"
          autoFocus
        />
      </div>

      {results.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            {searchQuery.trim() ? 'Resultados encontrados:' : 'Perguntas frequentes:'}
          </p>
          <Accordion type="single" collapsible className="space-y-1">
            {results.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-sm hover:no-underline py-3">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {searchQuery.trim() && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma pergunta encontrada para sua busca.
        </p>
      )}

      <div className="border-t pt-4">
        <Button onClick={onProceedToTicket} className="w-full">
          Minha dúvida não está aqui
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
