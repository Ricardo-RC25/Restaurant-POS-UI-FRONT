import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketModal } from '../components/TicketModal';
import { CashRegisterModal } from '../components/CashRegisterModal';
import { PageHeader } from '../components/PageHeader';
import { Search, Eye, DollarSign, TrendingUp, Calculator, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export function CashierView() {
  const { orders, currentUser, addCashRegister } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);

  // Solo mostrar órdenes PAGADAS (ya cobradas por el mesero)
  const paidOrders = orders.filter(order => order.status === 'paid');

  // Calcular totales del día
  const today = new Date().toDateString();
  const todayPaidOrders = paidOrders.filter(order => 
    order.paidAt && new Date(order.paidAt).toDateString() === today
  );
  
  const todayTotal = todayPaidOrders.reduce((sum, order) => sum + order.total, 0);
  const todayCount = todayPaidOrders.length;

  // Calcular totales por método de pago
  const totalCash = todayPaidOrders
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, order) => sum + order.total, 0);
  const totalCard = todayPaidOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((sum, order) => sum + order.total, 0);
  const totalMobile = todayPaidOrders
    .filter(o => o.paymentMethod === 'mobile')
    .reduce((sum, order) => sum + order.total, 0);

  const filteredOrders = paidOrders.filter(order => 
    order.id.includes(searchQuery) || 
    order.tableNumber.toString().includes(searchQuery) ||
    order.waiterName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleViewTicket = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowTicketModal(true);
  };

  const handleCashRegister = () => {
    setShowCashRegisterModal(true);
  };

  const handleConfirmCashRegister = () => {
    const cashRegister = {
      userId: currentUser?.id,
      date: new Date(),
      totalCash,
      totalCard,
      totalMobile,
      orderCount: todayCount,
    };
    addCashRegister(cashRegister);
    toast.success('Reporte de corte de caja generado');
    setShowCashRegisterModal(false);
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      mobile: 'Pago Móvil',
    };
    return labels[method as keyof typeof labels] || 'N/A';
  };

  const getPaymentMethodIcon = (method?: string) => {
    const icons = {
      cash: '💵',
      card: '💳',
      mobile: '📱',
    };
    return icons[method as keyof typeof icons] || '💰';
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="POS / CAJA"
        title="Registro de Ventas"
        subtitle="Consulta de tickets cobrados"
        actions={
          <>
            {/* Stats + Button - Desktop */}
            <div className="hidden lg:flex gap-6 items-center">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tickets del Día</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total del Día</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${todayTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCashRegister}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2e636e] text-white rounded-lg font-medium hover:bg-[#254f58] active:bg-[#1e4045] transition-colors touch-manipulation"
              >
                <Calculator className="w-5 h-5" />
                Corte de Caja
              </button>
            </div>

            {/* Stats - Mobile/Tablet */}
            <div className="lg:hidden w-full flex items-center gap-3">
              <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Tickets</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{todayCount}</p>
              </div>
              <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">${todayTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCashRegister}
                className="flex items-center gap-1 px-3 py-2.5 bg-[#2e636e] text-white rounded-lg font-medium hover:bg-[#254f58] active:bg-[#1e4045] transition-colors touch-manipulation whitespace-nowrap text-sm"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Corte</span>
              </button>
            </div>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {/* Search */}
        <div className="bg-card rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por # orden, mesa o mesero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-border bg-card text-card-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Orders - Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-lg shadow-sm p-8 text-center border border-border">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay tickets registrados</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg shadow-sm p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Orden</p>
                    <p className="text-lg font-bold text-card-foreground">#{order.id}</p>
                  </div>
                  <button
                    onClick={() => handleViewTicket(order.id)}
                    className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:bg-blue-100 dark:active:bg-blue-900/30 rounded-lg transition-colors touch-manipulation"
                    title="Ver Ticket"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Mesa</p>
                    <p className="text-sm font-medium text-card-foreground">Mesa {order.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Items</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Mesero</p>
                    <p className="text-sm font-medium text-card-foreground truncate">{order.waiterName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Hora</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {order.paidAt 
                        ? new Date(order.paidAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPaymentMethodIcon(order.paymentMethod)}</span>
                    <span className="text-sm text-muted-foreground">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden lg:block bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orden #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mesa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mesero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hora Cobro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                      No hay tickets registrados
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        Mesa {order.tableNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.waiterName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {getPaymentMethodIcon(order.paymentMethod)} {getPaymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.paidAt 
                          ? new Date(order.paidAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewTicket(order.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="Ver Ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Ticket */}
      {showTicketModal && selectedOrder ? (
        <TicketModal
          order={selectedOrder}
          onClose={() => setShowTicketModal(false)}
        />
      ) : null}

      {/* Modal de Corte de Caja */}
      {showCashRegisterModal ? (
        <CashRegisterModal
          totalCash={totalCash}
          totalCard={totalCard}
          totalMobile={totalMobile}
          orderCount={todayCount}
          onClose={() => setShowCashRegisterModal(false)}
          onConfirm={handleConfirmCashRegister}
        />
      ) : null}
    </div>
  );
}