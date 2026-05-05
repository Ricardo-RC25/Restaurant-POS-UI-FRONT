import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Clock, ChefHat, CheckCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';

export function KitchenView() {
  const { orders, updateOrder } = useApp();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready'); // Listas para entregar

  const handleStartPreparing = (orderId: string) => {
    updateOrder(orderId, { status: 'preparing' });
    toast.success('Orden en preparación');
  };

  const handleMarkReady = (orderId: string) => {
    updateOrder(orderId, { status: 'ready' });
    toast.success('Orden lista para entregar');
  };

  const OrderCard = ({ order, status }: { order: Order; status: 'pending' | 'preparing' | 'ready' }) => {
    const statusConfig = {
      pending: {
        color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600',
        icon: Clock,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        label: 'Pendiente',
        action: handleStartPreparing,
        actionLabel: 'Iniciar Preparación',
        actionColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
      },
      preparing: {
        color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600',
        icon: ChefHat,
        iconColor: 'text-blue-600 dark:text-blue-400',
        label: 'Preparando',
        action: handleMarkReady,
        actionLabel: 'Marcar como Lista',
        actionColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
      },
      ready: {
        color: 'border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600',
        icon: CheckCircle,
        iconColor: 'text-green-600 dark:text-green-400',
        label: 'Lista',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`bg-card rounded-lg border-2 ${config.color} p-3 sm:p-4 shadow-sm`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-card-foreground">Mesa {order.tableNumber}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Orden #{order.id}</p>
          </div>
          <div className={`p-1.5 sm:p-2 rounded-lg ${config.color}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
          </div>
        </div>

        <div className="mb-4 space-y-1.5 sm:space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs sm:text-sm">
              <span className="text-card-foreground">
                <span className="font-semibold">{item.quantity}x</span> {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="font-semibold">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        {config.action ? (
          <button
            onClick={() => config.action(order.id)}
            className={`w-full text-white py-2.5 sm:py-2 rounded-lg font-medium transition-colors touch-manipulation text-sm sm:text-base ${config.actionColor} active:opacity-80`}
          >
            {config.actionLabel}
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="POS / COCINA"
        title="Monitor de Órdenes"
        subtitle="Vista Kanban de preparación"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pending */}
          <div>
            <div className="bg-yellow-100 dark:bg-yellow-950/30 border-l-4 border-yellow-500 dark:border-yellow-600 px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4 rounded">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-card-foreground text-sm sm:text-base">Pendientes</h2>
                <span className="bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {pendingOrders.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No hay órdenes pendientes</p>
              ) : (
                pendingOrders.map(order => (
                  <OrderCard key={order.id} order={order} status="pending" />
                ))
              )}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="bg-blue-100 dark:bg-blue-950/30 border-l-4 border-blue-500 dark:border-blue-600 px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4 rounded">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-card-foreground text-sm sm:text-base">En Preparación</h2>
                <span className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {preparingOrders.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {preparingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No hay órdenes en preparación</p>
              ) : (
                preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} status="preparing" />
                ))
              )}
            </div>
          </div>

          {/* Ready */}
          <div>
            <div className="bg-green-100 dark:bg-green-950/30 border-l-4 border-green-500 dark:border-green-600 px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4 rounded">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-card-foreground text-sm sm:text-base">Listas para Entregar</h2>
                <span className="bg-green-500 dark:bg-green-600 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {readyOrders.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {readyOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No hay órdenes listas para entregar</p>
              ) : (
                readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} status="ready" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}