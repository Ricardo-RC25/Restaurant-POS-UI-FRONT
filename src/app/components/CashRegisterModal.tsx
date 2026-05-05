import { X, Printer, DollarSign, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface CashRegisterModalProps {
  onClose: () => void;
  onConfirm: () => void;
  totalCash: number;
  totalCard: number;
  totalMobile: number;
  orderCount: number;
}

export function CashRegisterModal({
  onClose,
  onConfirm,
  totalCash,
  totalCard,
  totalMobile,
  orderCount,
}: CashRegisterModalProps) {
  const total = totalCash + totalCard + totalMobile;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Corte de Caja</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Resumen Total */}
          <div className="bg-muted rounded-xl p-5 sm:p-6 border border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total del Día</p>
            <p className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">{formatCurrency(total)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{orderCount} Tickets Cobrados</p>
          </div>

          {/* Desglose por Método de Pago */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Desglose por Método de Pago</h3>
            
            <div className="bg-card border-2 border-border rounded-lg p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Efectivo</p>
                  <p className="text-xs text-muted-foreground">Cash</p>
                </div>
              </div>
              <p className="text-base sm:text-lg font-semibold text-card-foreground">{formatCurrency(totalCash)}</p>
            </div>

            <div className="bg-card border-2 border-border rounded-lg p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Tarjeta</p>
                  <p className="text-xs text-muted-foreground">Card</p>
                </div>
              </div>
              <p className="text-base sm:text-lg font-semibold text-card-foreground">{formatCurrency(totalCard)}</p>
            </div>

            <div className="bg-card border-2 border-border rounded-lg p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Pago Móvil</p>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                </div>
              </div>
              <p className="text-base sm:text-lg font-semibold text-card-foreground">{formatCurrency(totalMobile)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors touch-manipulation text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Imprimir Reporte</span>
            <span className="sm:hidden">Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}