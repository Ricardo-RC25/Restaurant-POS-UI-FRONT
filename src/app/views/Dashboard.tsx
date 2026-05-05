import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

export function DashboardView() {
  const { orders, menuItems } = useApp();

  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return order.createdAt.toDateString() === today;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(order => order.status !== 'completed').length;

  const stats = [
    {
      label: 'Ventas Hoy',
      value: formatCurrency(todayRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Órdenes Hoy',
      value: todayOrders.length,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      label: 'Órdenes Activas',
      value: activeOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      label: 'Productos en Menú',
      value: menuItems.length,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  const recentOrders = orders.slice(-5).reverse();

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Listo',
      completed: 'Completado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      ready: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      completed: 'bg-muted text-muted-foreground',
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <PageHeader
        breadcrumb="POS / DASHBOARD"
        title="Dashboard"
        subtitle="Resumen general del restaurante"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-card rounded-lg shadow-sm p-4 sm:p-6 border border-border">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Órdenes Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mesa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        Mesa {order.tableNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-card-foreground">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? 'Pendiente' : order.status === 'preparing' ? 'En Cocina' : order.status === 'ready' ? 'Listo' : 'Entregado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}