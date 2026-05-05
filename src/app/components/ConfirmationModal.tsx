import { CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';

// ============================================================================
// INTERFACES
// ============================================================================

interface ConfirmationModalProps {
  orderNumber: string;
  total: number;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConfirmationModal({ orderNumber, total, onClose }: ConfirmationModalProps) {
  // Render
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border modal-content-mobile sm:modal-content">
        <div className="p-6 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-accent mb-2">¡Orden Confirmada!</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Tu orden ha sido enviada a la cocina
          </p>
          
          {/* Order Details */}
          <div className="bg-muted rounded-xl p-4 mb-6 border border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Número de Orden</p>
            <p className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3">#{orderNumber}</p>
            <div className="border-t border-border pt-3">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(total)}</p>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#2e636e] text-white rounded-xl font-medium hover:bg-[#a2774c] active:bg-[#8a6339] transition-colors shadow-md touch-manipulation text-sm sm:text-base"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}