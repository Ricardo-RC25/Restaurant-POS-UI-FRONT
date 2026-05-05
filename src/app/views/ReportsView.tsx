import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { ReportDetailsModal } from '../components/ReportDetailsModal';
import { PageHeader } from '../components/PageHeader';
import { FileText, Download, Calendar, DollarSign, TrendingUp, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsView() {
  const { orders, menuItems, auditLogs } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [showReportModal, setShowReportModal] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getOrdersForPeriod = () => {
    const now = new Date();
    let startDate = new Date(today);

    if (selectedPeriod === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    return orders.filter(order => order.createdAt >= startDate);
  };

  const periodOrders = getOrdersForPeriod();
  const completedOrders = periodOrders.filter(o => o.status === 'completed');
  const cancelledOrders = periodOrders.filter(o => o.status === 'cancelled');
  
  const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCancellations = cancelledOrders.reduce((sum, order) => sum + order.total, 0);
  const averageTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

  // Productos más vendidos
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.id].quantity += item.quantity;
      productSales[item.id].revenue += item.priceClient * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const lowStockProducts = menuItems
    .filter(item => item.stock <= item.minStock)
    .sort((a, b) => a.stock - b.stock);

  // Datos para el modal de reporte completo
  const reportData = {
    period: selectedPeriod === 'today' ? 'Hoy' : selectedPeriod === 'week' ? 'Última Semana' : 'Último Mes',
    totalSales,
    totalOrders: completedOrders.length,
    averageTicket,
    topProducts: topProducts.slice(0, 5),
    topWaiters: [
      { name: 'Juan Pérez', orders: 15, revenue: 1250.50 },
      { name: 'María García', orders: 12, revenue: 980.00 },
      { name: 'Carlos López', orders: 8, revenue: 650.25 },
    ],
    salesByDay: [
      { day: 'Lunes', sales: 450.00 },
      { day: 'Martes', sales: 520.50 },
      { day: 'Miércoles', sales: 380.00 },
      { day: 'Jueves', sales: 610.25 },
      { day: 'Viernes', sales: 750.00 },
      { day: 'Sábado', sales: 890.50 },
      { day: 'Domingo', sales: 680.00 },
    ],
  };

  const handleViewFullReport = () => {
    setShowReportModal(true);
  };

  const handleExportPDF = () => {
    toast.success('Reporte exportado exitosamente');
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        title="Reportes"
        subtitle="Ver estadísticas y reportes"
        breadcrumb="BACK OFFICE / REPORTES"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Period Selector */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border border-border">
          <div className="flex gap-2">
            {[
              { value: 'today', label: 'Hoy' },
              { value: 'week', label: 'Última semana' },
              { value: 'month', label: 'Último mes' },
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Ventas Totales</p>
            <p className="text-2xl font-bold text-card-foreground">${totalSales.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Órdenes Completadas</p>
            <p className="text-2xl font-bold text-card-foreground">{completedOrders.length}</p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Ticket Promedio</p>
            <p className="text-2xl font-bold text-card-foreground">${averageTicket.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Cancelaciones</p>
            <p className="text-2xl font-bold text-card-foreground">{cancelledOrders.length}</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-card-foreground">Productos Más Vendidos</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} vendidos</p>
                      </div>
                    </div>
                    <p className="font-semibold text-card-foreground">${product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-card-foreground">Productos con Stock Bajo</h2>
            </div>
            <div className="p-6">
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay productos con stock bajo</p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-card-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {product.stock} unidades
                        </p>
                        <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-card rounded-lg shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground">Historial de Actividad Reciente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {(auditLogs || []).slice(0, 10).map((log) => (
                <div key={log.id} className="flex justify-between items-start py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground">Por: {log.userName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {log.timestamp.toLocaleString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Details Modal - FUERA del contenedor con overflow */}
      {showReportModal && (
        <ReportDetailsModal
          reportData={reportData}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}