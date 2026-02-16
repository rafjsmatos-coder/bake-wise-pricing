import { useState, useMemo } from 'react';
import { useClients, Client, ClientFormData } from '@/hooks/useClients';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientDetails } from '@/components/clients/ClientDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Users, Loader2 } from 'lucide-react';

export function ClientsList() {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.whatsapp?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

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

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
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

  const handleDelete = () => {
    if (selectedClient) {
      deleteClient.mutate(selectedClient.id, {
        onSuccess: () => setDeleteDialogOpen(false),
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

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
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
              onDelete={handleDeleteClick}
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{selectedClient?.name}</strong>?
              Todos os pedidos vinculados a este cliente também serão excluídos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
