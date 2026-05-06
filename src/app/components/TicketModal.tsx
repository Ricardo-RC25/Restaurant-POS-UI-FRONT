import { X, Printer } from 'lucide-react';
import { Order } from '../types';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';

interface TicketModalProps {
  order: Order;
  onClose: () => void;
}

export function TicketModal({ order, onClose }: TicketModalProps) {
  // Calcular subtotal incluyendo extras
  const subtotal = order.items.reduce((sum, item) => {
    const itemPrice = item.priceClient;
    const extrasPrice = item.extras?.reduce((extraSum, extra) => extraSum + extra.price, 0) || 0;
    return sum + ((itemPrice + extrasPrice) * item.quantity);
  }, 0);
  const tax = subtotal * 0.08;

  // Obtener información del negocio
  const [businessInfo, setBusinessInfo] = useState({
    name: localStorage.getItem('restaurantName') || 'Taquería POS',
    address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
    phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
    website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setBusinessInfo({
        name: localStorage.getItem('restaurantName') || 'Taquería POS',
        address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
        phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
        website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('businessInfoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('businessInfoUpdated', handleStorageChange);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Listo',
      completed: 'Completado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-accent">Ticket #{order.id}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-primary hover:text-accent rounded-lg transition-colors touch-manipulation"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-primary hover:text-accent p-1 touch-manipulation transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Restaurant Info */}
          <div className="text-center border-b border-border pb-4">
            <h3 className="font-bold text-base sm:text-lg text-card-foreground">{businessInfo.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{businessInfo.address}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{businessInfo.phone}</p>
          </div>

          {/* Order Info */}
          <div className="border-b border-border pb-4">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="text-card-foreground">
                {order.createdAt.toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-muted-foreground">Hora:</span>
              <span className="text-card-foreground">
                {order.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-muted-foreground">Mesa:</span>
              <span className="text-card-foreground font-semibold">Mesa {order.tableNumber}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Estado:</span>
              <span className="text-card-foreground">{getStatusLabel(order.status)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-card-foreground mb-3">Productos</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const itemTotal = item.priceClient * item.quantity;
                const extrasTotal = (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0) * item.quantity;
                const lineTotal = itemTotal + extrasTotal;

                return (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-card-foreground font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        {item.extras && item.extras.length > 0 ? (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {item.extras.map((extra, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                + {extra.name} {extra.price > 0 ? `(${formatCurrency(extra.price)})` : ''}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {item.notes ? (
                          <p className="text-xs text-muted-foreground italic ml-4 mt-1">
                            Nota: {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-card-foreground font-medium ml-4">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-card-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (8%):</span>
              <span className="text-card-foreground">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-border">
              <span className="text-card-foreground">TOTAL:</span>
              <span className="text-card-foreground">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">¡Gracias por su visita!</p>
            <p className="text-xs text-muted-foreground mt-1">{businessInfo.website}</p>
          </div>
        </div>

        <div className="p-6 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-muted text-card-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}