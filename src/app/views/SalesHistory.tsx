import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { TicketModal } from '../components/TicketModal';
import { Search, Eye, Calendar, DollarSign, TrendingUp, Clock, User, CreditCard, Smartphone, Banknote, Filter, Receipt, Calculator } from 'lucide-react';
import { Order } from '../types';

export function SalesHistory() {
  const { orders, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'mobile'>('all');

  // Filtrar solo órdenes pagadas
  const paidOrders = useMemo(() => {
    return orders.filter(order => order.status === 'paid');
  }, [orders]);

  // Aplicar filtros de fecha
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return paidOrders.filter(order => {
      if (!order.paidAt) return false;
      const orderDate = new Date(order.paidAt);

      switch (dateFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          return orderDate >= weekAgo;
        case 'month':
          return orderDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  }, [paidOrders, dateFilter]);

  // Aplicar filtro de método de pago
  const filteredByPayment = useMemo(() => {
    if (paymentFilter === 'all') return filteredByDate;
    return filteredByDate.filter(order => order.paymentMethod === paymentFilter);
  }, [filteredByDate, paymentFilter]);

  // Aplicar búsqueda
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return filteredByPayment;
    
    return filteredByPayment.filter(order =>
      order.id.includes(searchQuery) ||
      order.tableNumber.toString().includes(searchQuery) ||
      order.waiterName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByPayment, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = filteredByPayment.reduce((sum, order) => sum + order.total, 0);
    const count = filteredByPayment.length;
    const average = count > 0 ? total / count : 0;

    const byCash = filteredByPayment
      .filter(o => o.paymentMethod === 'cash')
      .reduce((sum, order) => sum + order.total, 0);
    const byCard = filteredByPayment
      .filter(o => o.paymentMethod === 'card')
      .reduce((sum, order) => sum + order.total, 0);
    const byMobile = filteredByPayment
      .filter(o => o.paymentMethod === 'mobile')
      .reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      count,
      average,
      byCash,
      byCard,
      byMobile,
    };
  }, [filteredByPayment]);

  const handleViewTicket = (order: Order) => {
    setSelectedOrder(order);
    setShowTicketModal(true);
  };

  const getPaymentMethodInfo = (method?: string) => {
    switch (method) {
      case 'cash':
        return { label: 'Efectivo', icon: Banknote, color: 'text-green-600 dark:text-green-400' };
      case 'card':
        return { label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600 dark:text-blue-400' };
      case 'mobile':
        return { label: 'Transferencia', icon: Smartphone, color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { label: 'Desconocido', icon: DollarSign, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / HISTORIAL"
        title="Historial de Ventas"
        subtitle="Consulta todas las órdenes cobradas"
        actions={
          currentUser ? (
            <div className="text-right">
              <p className="text-xs text-[#a2774c] uppercase tracking-wide">Usuario</p>
              <p className="font-semibold text-foreground">{currentUser.name}</p>
            </div>
          ) : null
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#2e636e] to-[#a2774c] text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90">Total Vendido</p>
            <p className="text-3xl font-bold">${stats.total.toFixed(2)}</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-8 h-8 text-[#a2774c]" />
            </div>
            <p className="text-sm text-muted-foreground">Órdenes</p>
            <p className="text-3xl font-bold text-foreground">{stats.count}</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="w-8 h-8 text-[#2e636e]" />
            </div>
            <p className="text-sm text-muted-foreground">Ticket Promedio</p>
            <p className="text-3xl font-bold text-foreground">${stats.average.toFixed(2)}</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-[#6c5033]" />
            </div>
            <p className="text-sm text-muted-foreground">Período</p>
            <p className="text-xl font-bold text-foreground">
              {dateFilter === 'today' ? 'Hoy' : 
               dateFilter === 'week' ? 'Última semana' : 
               dateFilter === 'month' ? 'Último mes' : 'Todo'}
            </p>
          </div>
        </div>

        {/* Estadísticas por método de pago */}
        <div className="bg-card rounded-xl shadow-md p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#a2774c]" />
            Ventas por Método de Pago
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Banknote className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">Efectivo</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">${stats.byCash.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Tarjeta</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">${stats.byCard.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Smartphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Transferencia</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">${stats.byMobile.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-xl shadow-md p-6 border border-border space-y-4">
          <h3 className="text-lg font-bold text-foreground">Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="# Orden, Mesa, Mesero..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                />
              </div>
            </div>

            {/* Filtro de fecha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
              >
                <option value="all">Todo el historial</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
              </select>
            </div>

            {/* Filtro de método de pago */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Método de Pago
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
              >
                <option value="all">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="mobile">Transferencia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Mesa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Mesero
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No se encontraron órdenes</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const paymentInfo = getPaymentMethodInfo(order.paymentMethod);
                    const PaymentIcon = paymentInfo.icon;

                    return (
                      <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-foreground">
                            #{order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-foreground">
                            Mesa {order.tableNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {order.waiterName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {order.paidAt ? new Date(order.paidAt).toLocaleDateString('es-ES') : 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.paidAt ? new Date(order.paidAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PaymentIcon className={`w-4 h-4 ${paymentInfo.color}`} />
                            <span className="text-sm text-foreground">{paymentInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-bold text-foreground">
                            ${order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewTicket(order)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2e636e] dark:bg-[#3d7a89] text-white rounded-lg hover:bg-[#a2774c] dark:hover:bg-[#c8956b] transition-colors shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Ticket
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen al final */}
        {filteredOrders.length > 0 ? (
          <div className="bg-gradient-to-r from-[#2e636e] to-[#a2774c] text-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-90">Resultados de búsqueda</p>
                <p className="text-2xl font-bold">{filteredOrders.length} órdenes encontradas</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total mostrado</p>
                <p className="text-3xl font-bold">
                  ${filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal de ticket */}
      {showTicketModal && selectedOrder ? (
        <TicketModal
          order={selectedOrder}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedOrder(null);
          }}
        />
      ) : null}
    </div>
  );
}