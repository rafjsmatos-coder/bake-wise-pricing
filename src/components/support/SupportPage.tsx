import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Headphones, Lightbulb, Plus, Loader2 } from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { TicketList } from './TicketList';
import { TicketForm } from './TicketForm';
import { SuggestionForm } from './SuggestionForm';
import { TicketDetails } from './TicketDetails';
import type { SupportTicket } from '@/hooks/useSupport';

export function SupportPage() {
  const { supportTickets, suggestions, isLoading, refetch } = useSupport();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const hasActiveTicket = supportTickets.some(t => t.status === 'open' || t.status === 'in_progress');
  const hasActiveSuggestion = suggestions.some(s => s.status === 'open' || s.status === 'in_progress');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        onBack={() => {
          setSelectedTicket(null);
          refetch();
        }}
      />
    );
  }

  if (showTicketForm) {
    return (
      <TicketForm
        onSuccess={() => {
          setShowTicketForm(false);
          refetch();
        }}
        onCancel={() => setShowTicketForm(false)}
      />
    );
  }

  if (showSuggestionForm) {
    return (
      <SuggestionForm
        onSuccess={() => {
          setShowSuggestionForm(false);
          refetch();
        }}
        onCancel={() => setShowSuggestionForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Suporte</h1>
          <p className="text-sm text-muted-foreground">
            Abra tickets de suporte ou envie sugestões para melhorar o sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Meus Tickets
              {supportTickets.length > 0 && (
                <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                  {supportTickets.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Minhas Sugestões
              {suggestions.length > 0 && (
                <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                  {suggestions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {hasActiveTicket ? (
              <p className="text-sm text-muted-foreground">
                Você já tem um ticket em aberto. Aguarde a resolução antes de abrir outro.
              </p>
            ) : (
              <div />
            )}
            <Button onClick={() => setShowTicketForm(true)} disabled={hasActiveTicket}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </div>
          <TicketList
            tickets={supportTickets}
            onSelect={setSelectedTicket}
            emptyMessage="Você não tem tickets de suporte"
            emptyDescription="Abra um ticket se precisar de ajuda com o sistema"
          />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {hasActiveSuggestion ? (
              <p className="text-sm text-muted-foreground">
                Você já tem uma sugestão em aberto. Aguarde a resposta antes de enviar outra.
              </p>
            ) : (
              <div />
            )}
            <Button onClick={() => setShowSuggestionForm(true)} disabled={hasActiveSuggestion}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sugestão
            </Button>
          </div>
          <TicketList
            tickets={suggestions}
            onSelect={setSelectedTicket}
            emptyMessage="Você não enviou sugestões ainda"
            emptyDescription="Compartilhe suas ideias para melhorar o PreciBake"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
