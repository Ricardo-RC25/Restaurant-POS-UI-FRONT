import { X, TrendingUp, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';

interface ReportDetailsModalProps {
  onClose: () => void;
  reportData: {
    period: string;
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
    topWaiters: Array<{ name: string; orders: number; revenue: number }>;
    salesByDay: Array<{ day: string; sales: number }>;
  };
}

export function ReportDetailsModal({ onClose, reportData }: ReportDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-accent">Reporte Detallado de Ventas</h2>
            <p className="text-xs sm:text-sm text-primary mt-1">{reportData.period}</p>
          </div>
          <button onClick={onClose} className="text-primary hover:text-accent p-1 touch-manipulation transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/10 rounded-xl p-5 border-2 border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Ventas Totales</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">${reportData.totalSales.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total de Órdenes</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportData.totalOrders}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/10 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${reportData.averageTicket.toFixed(2)}</p>
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-background rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-accent">Top Productos</h3>
            </div>
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between bg-card rounded-lg p-3 border-2 border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} vendidos</p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">${product.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Meseros */}
          <div className="bg-background rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-accent">Top Meseros</h3>
            </div>
            <div className="space-y-3">
              {reportData.topWaiters.map((waiter, index) => (
                <div key={index} className="flex items-center justify-between bg-card rounded-lg p-3 border-2 border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{waiter.name}</p>
                      <p className="text-xs text-muted-foreground">{waiter.orders} órdenes</p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">${waiter.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ventas por Día */}
          <div className="bg-background rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-accent">Ventas por Día</h3>
            </div>
            <div className="space-y-2">
              {reportData.salesByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between bg-card rounded-lg p-3 border-2 border-border">
                  <p className="text-sm font-medium text-card-foreground">{day.day}</p>
                  <p className="font-semibold text-accent">${day.sales.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium text-accent hover:bg-background transition-colors"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}