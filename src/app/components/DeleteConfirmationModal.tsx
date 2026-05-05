import { AlertTriangle, X } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DeleteConfirmationModal({ 
  title, 
  message, 
  itemName, 
  onConfirm, 
  onClose 
}: DeleteConfirmationModalProps) {
  // Handlers
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Render
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-card-foreground">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {itemName && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Elemento a eliminar:</p>
              <p className="text-sm font-medium text-card-foreground">{itemName}</p>
            </div>
          )}
          <p className="text-xs text-red-600 dark:text-red-400 mt-4 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Esta acción no se puede deshacer
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-card-foreground bg-muted hover:bg-muted/80 active:bg-muted/90 transition-colors touch-manipulation"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-700 dark:hover:bg-red-800 active:bg-red-800 dark:active:bg-red-900 transition-colors touch-manipulation"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}