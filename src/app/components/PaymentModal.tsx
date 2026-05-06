import { useState, useEffect, memo, useCallback } from 'react';
import { Order, PaymentMethod } from '../types';
import { CreditCard, Smartphone, Banknote, X, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/format';

// ============================================================================
// INTERFACES
// ============================================================================

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onPay: (order: Order, method: PaymentMethod) => void | Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PaymentModal = memo(function PaymentModal({ order, onClose, onPay }: PaymentModalProps) {
  // Estados
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [amountReceived, setAmountReceived] = useState('');

  // Estados derivados
  const change = amountReceived ? parseFloat(amountReceived) - order.total : 0;

  // Handlers
  const handleConfirm = useCallback(() => {
    onPay(order, selectedMethod);
  }, [order, selectedMethod, onPay]);

  const handleMethodChange = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
  }, []);

  // Render
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-accent">Cobrar Orden #{order.id}</h2>
          <button 
            onClick={onClose} 
            className="text-primary hover:text-accent p-1 touch-manipulation"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Total */}
          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Mesa {order.tableNumber}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total a Cobrar</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#6c5033] dark:text-[#d4a574]">
              {formatCurrency(order.total)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-3">Método de Pago</p>
            <div className="space-y-2">
              <button
                onClick={() => handleMethodChange('card')}
                className={`w-full p-3 sm:p-4 rounded-lg border flex items-center gap-3 transition-colors touch-manipulation ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-border hover:border-primary bg-card'
                }`}
              >
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-card-foreground" />
                <span className="font-medium text-card-foreground text-sm sm:text-base">Tarjeta</span>
              </button>

              <button
                onClick={() => handleMethodChange('cash')}
                className={`w-full p-3 sm:p-4 rounded-lg border flex items-center gap-3 transition-colors touch-manipulation ${
                  selectedMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-border hover:border-primary bg-card'
                }`}
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-card-foreground" />
                <span className="font-medium text-card-foreground text-sm sm:text-base">Efectivo</span>
              </button>

              <button
                onClick={() => handleMethodChange('bank')}
                className={`w-full p-3 sm:p-4 rounded-lg border flex items-center gap-3 transition-colors touch-manipulation ${
                  selectedMethod === 'bank'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-border hover:border-primary bg-card'
                }`}
              >
                <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-card-foreground" />
                <span className="font-medium text-card-foreground text-sm sm:text-base">Transferencia Bancaria</span>
              </button>
            </div>
          </div>

          {/* Cash Input */}
          {selectedMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Monto Recibido
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border-2 border-border bg-card text-card-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                step="0.01"
              />
              {change > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Cambio: <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(change)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedMethod === 'cash' && (!amountReceived || change < 0)}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
  });