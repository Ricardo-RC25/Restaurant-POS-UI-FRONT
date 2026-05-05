import { useState } from 'react';

import { toast } from 'sonner';

import { Check, X } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface AddTableModalProps {
  onClose: () => void;
  onAdd: (tableNumber: number) => void;
  existingTableNumbers: number[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddTableModal({ onClose, onAdd, existingTableNumbers }: AddTableModalProps) {
  // Estados
  const [tableNumber, setTableNumber] = useState('');

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const number = parseInt(tableNumber);
    
    if (!tableNumber || isNaN(number)) {
      toast.error('Por favor ingresa un número válido');
      return;
    }

    if (number < 1) {
      toast.error('El número debe ser mayor a 0');
      return;
    }

    if (existingTableNumbers.includes(number)) {
      toast.error('Esta mesa ya existe');
      return;
    }

    onAdd(number);
  };

  // Render
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Agregar Nueva Mesa</h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                Ingresa el número de mesa que deseas agregar al sistema. Este número será usado para identificar la mesa en el sistema POS.
              </p>
            </div>

            {/* Table Number Input */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Número de Mesa *
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ej: 15"
                min="1"
                className="w-full px-4 py-3 border border-border bg-background text-card-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground text-base"
                autoFocus
              />
            </div>

            {/* Preview */}
            {tableNumber && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-4 text-center border-2 border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">Vista Previa</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                  Mesa {tableNumber}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-border flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors touch-manipulation text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base"
            >
              <Check className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}