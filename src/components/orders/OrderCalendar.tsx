import { useState, useMemo } from 'react';
import { Order } from '@/hooks/useOrders';
import { getStatusColor } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderCalendarProps {
  orders: Order[];
  onDayClick: (date: Date, dayOrders: Order[]) => void;
}

export function OrderCalendar({ orders, onDayClick }: OrderCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getOrdersForDay = (day: Date): Order[] => {
    return orders.filter((order) => {
      if (!order.delivery_date) return false;
      return isSameDay(new Date(order.delivery_date), day);
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayOrders = getOrdersForDay(day);
            const inCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <button
                key={index}
                onClick={() => dayOrders.length > 0 && onDayClick(day, dayOrders)}
                className={`
                  min-h-[60px] sm:min-h-[80px] p-1 border-t border-r border-border text-left transition-colors
                  ${!inCurrentMonth ? 'bg-muted/30 text-muted-foreground/50' : 'hover:bg-muted/50'}
                  ${dayOrders.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                  ${index % 7 === 0 ? 'border-l-0' : ''}
                `}
              >
                <span
                  className={`
                    text-xs sm:text-sm font-medium inline-flex items-center justify-center
                    ${today ? 'bg-accent text-accent-foreground rounded-full w-6 h-6 sm:w-7 sm:h-7' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>

                {/* Order dots */}
                {dayOrders.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayOrders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                        title={order.client?.name || 'Pedido'}
                      />
                    ))}
                    {dayOrders.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayOrders.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {[
          { status: 'pending', label: 'Pendente' },
          { status: 'in_production', label: 'Em produção' },
          { status: 'ready', label: 'Pronto' },
          { status: 'delivered', label: 'Entregue' },
          { status: 'cancelled', label: 'Cancelado' },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
