import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  in_production: { label: 'Em produção', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  ready: { label: 'Pronto', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
  delivered: { label: 'Entregue', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

const paymentConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Não pago', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
  partial: { label: 'Parcial', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  paid: { label: 'Pago', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
};

interface OrderStatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
}

export function OrderStatusBadge({ status, type = 'order' }: OrderStatusBadgeProps) {
  const config = type === 'payment' ? paymentConfig : statusConfig;
  const { label, className } = config[status] || { label: status, className: '' };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: '#eab308',
    in_production: '#3b82f6',
    ready: '#22c55e',
    delivered: '#9ca3af',
    cancelled: '#ef4444',
  };
  return colorMap[status] || '#6b7280';
}

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'ready', label: 'Pronto' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];
