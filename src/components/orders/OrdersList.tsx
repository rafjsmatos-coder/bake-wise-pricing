import { useState, useMemo } from 'react';
import { useOrders, Order, OrderFormData } from '@/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { OrderCalendar } from '@/components/orders/OrderCalendar';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { StockDeductionDialog } from '@/components/orders/StockDeductionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, ClipboardList, Loader2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';

export function OrdersList() {
  const { orders, isLoading, createOrder, updateOrder, updateOrderStatus, deleteOrder, duplicateOrder } = useOrders();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayOrdersOpen, setDayOrdersOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dayOrders, setDayOrders] = useState<{ date: Date; orders: Order[] }>({ date: new Date(), orders: [] });
  const [stockDeductionOpen, setStockDeductionOpen] = useState(false);
  const [stockDeductionOrder, setStockDeductionOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.client?.name?.toLowerCase().includes(query) ||
          o.notes?.toLowerCase().includes(query) ||
          o.order_items?.some((item) =>
            item.product?.name?.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  const handleCreate = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormOpen(true);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (data: OrderFormData) => {
    if (selectedOrder) {
      updateOrder.mutate(
        { id: selectedOrder.id, data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createOrder.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (selectedOrder) {
      deleteOrder.mutate(selectedOrder.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const handleStatusChange = (orderId: string, status: string) => {
    // Fechar detalhes primeiro para evitar conflito de dialogs
    setDetailsOpen(false);

    updateOrderStatus.mutate({ id: orderId, status }, {
      onSuccess: () => {
        if (status === 'delivered') {
          const order = orders.find((o) => o.id === orderId);
          if (order && order.order_items && order.order_items.length > 0) {
            // Pequeno delay para garantir que o dialog anterior fechou
            setTimeout(() => {
              setStockDeductionOrder(order);
              setStockDeductionOpen(true);
            }, 300);
          }
        }
      },
    });
  };

  const handleDuplicate = (order: Order) => {
    duplicateOrder.mutate(order);
  };

  const handleDayClick = (date: Date, dayOrds: Order[]) => {
    setDayOrders({ date, orders: dayOrds });
    setDayOrdersOpen(true);
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
          <h1 className="text-2xl font-bold text-foreground truncate">Pedidos</h1>
          <p className="text-muted-foreground">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Tabs: Lista / Calendário */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Filters */}
          {orders.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 min-h-[44px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_production">Em produção</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* List */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido registrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro pedido para gerenciar entregas.
              </p>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Pedido
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido encontrado
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <OrderCalendar orders={orders} onDayClick={handleDayClick} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <OrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        order={selectedOrder}
        onSubmit={handleSubmit}
        isLoading={createOrder.isPending || updateOrder.isPending}
      />

      {/* Details Dialog */}
      <OrderDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onDuplicate={handleDuplicate}
      />

      {/* Day Orders Dialog */}
      <Dialog open={dayOrdersOpen} onOpenChange={setDayOrdersOpen}>
        <DialogContent className="max-w-md max-h-[100dvh] overflow-y-auto sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              Pedidos - {format(dayOrders.date, "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dayOrders.orders.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setDayOrdersOpen(false);
                  handleView(order);
                }}
                className="w-full text-left p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{order.client?.name}</span>
                  <span className="text-sm font-bold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <OrderStatusBadge status={order.payment_status} type="payment" />
                  {order.delivery_date && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(order.delivery_date), 'HH:mm')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido de{' '}
              <strong>{selectedOrder?.client?.name}</strong>? Esta ação não pode ser desfeita.
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

      {/* Stock Deduction Dialog */}
      <StockDeductionDialog
        open={stockDeductionOpen}
        onOpenChange={setStockDeductionOpen}
        order={stockDeductionOrder}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['ingredients'] });
          queryClient.invalidateQueries({ queryKey: ['decorations'] });
          queryClient.invalidateQueries({ queryKey: ['packaging'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />
    </div>
  );
}
