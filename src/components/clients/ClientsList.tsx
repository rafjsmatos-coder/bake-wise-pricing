import { useState, useMemo, useEffect } from 'react';
import { useClients, Client, ClientFormData } from '@/hooks/useClients';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientDetails } from '@/components/clients/ClientDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteOrDeactivateDialog } from '@/components/shared/DeleteOrDeactivateDialog';
import { Plus, Search, Users, Loader2 } from 'lucide-react';

interface ClientsListProps {
  initialSearch?: string;
}

export function ClientsList({ initialSearch = '' }: ClientsListProps) {
  const { clients, isLoading, createClient, updateClient, deleteClient, deactivateClient } = useClients();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [cityFilter, setCityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  const uniqueCities = useMemo(() => {
    const cities = clients
      .map(c => c.city)
      .filter((city): city is string => !!city && city.trim() !== '')
      .map(city => city.trim());
    return [...new Set(cities)].sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    let filtered = clients;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.whatsapp?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }
    if (cityFilter !== 'all') {
      filtered = filtered.filter(c => c.city?.trim() === cityFilter);
    }
    return filtered;
  }, [clients, searchQuery, cityFilter]);

  const handleCreate = () => {
    setSelectedClient(null);
    setFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const handleSubmit = (data: ClientFormData) => {
    if (selectedClient) {
      updateClient.mutate(
        { id: selectedClient.id, data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createClient.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Clientes</h1>
          <p className="text-muted-foreground">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      {clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[44px]"
            />
          </div>
          {uniqueCities.length > 0 && (
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* List */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(c) => setDeletingClient(c)}
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece cadastrando seus clientes para gerenciar pedidos.
          </p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Cadastrar Primeiro Cliente
          </Button>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum cliente encontrado para "{searchQuery}"
        </div>
      )}

      {/* Form Dialog */}
      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
        onSubmit={handleSubmit}
        isLoading={createClient.isPending || updateClient.isPending}
      />

      {/* Details Dialog */}
      <ClientDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        client={selectedClient}
        onEdit={handleEdit}
      />

      {/* Delete / Deactivate Dialog */}
      {deletingClient && (
        <DeleteOrDeactivateDialog
          open={!!deletingClient}
          onOpenChange={() => setDeletingClient(null)}
          entityType="client"
          entityId={deletingClient.id}
          entityName={deletingClient.name}
          onHardDelete={async () => {
            await deleteClient.mutateAsync(deletingClient.id);
            setDeletingClient(null);
          }}
          onDeactivate={async () => {
            await deactivateClient.mutateAsync(deletingClient.id);
            setDeletingClient(null);
          }}
          isLoading={deleteClient.isPending || deactivateClient.isPending}
        />
      )}
    </div>
  );
}
