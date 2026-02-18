import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, HelpCircle, Headphones } from 'lucide-react';
import { useFAQ } from '@/hooks/useFAQ';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface FAQTabProps {
  onOpenTicket: () => void;
}

export function FAQTab({ onOpenTicket }: FAQTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { getCategoriesWithItems, isLoading } = useFAQ();

  const categoriesWithItems = getCategoriesWithItems(searchQuery || undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar dúvida..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {categoriesWithItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'Nenhuma pergunta encontrada' : 'Nenhuma pergunta cadastrada ainda'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchQuery
              ? 'Tente buscar com outras palavras ou abra um ticket'
              : 'Em breve teremos respostas para as dúvidas mais comuns'}
          </p>
          <Button variant="outline" onClick={onOpenTicket}>
            <Headphones className="h-4 w-4 mr-2" />
            Abrir Ticket de Suporte
          </Button>
        </div>
      ) : (
        <>
          <Accordion type="multiple" className="space-y-2">
            {categoriesWithItems.map((category) => (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {category.items.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-1">
                    {category.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border-0 border-b last:border-b-0"
                      >
                        <AccordionTrigger
                          className="text-sm hover:no-underline py-3"
                          onClick={() => {
                            supabase.rpc('increment_faq_view', { item_id: item.id });
                          }}
                        >
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="border-t pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Não encontrou sua resposta?
            </p>
            <Button variant="outline" onClick={onOpenTicket}>
              <Headphones className="h-4 w-4 mr-2" />
              Abrir Ticket de Suporte
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
