import { X, AlertTriangle, Package } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

interface LowStockModalProps {
  items: LowStockItem[];
  onClose: () => void;
  onRestock: (itemId: string) => void;
}

export function LowStockModal({ items, onClose, onRestock }: LowStockModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-semibold text-accent">Alerta de Inventario Bajo</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{items.length} productos requieren reabastecimiento</p>
            </div>
          </div>
          <button onClick={onClose} className="text-primary hover:text-accent p-1 touch-manipulation transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-muted border-2 border-border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-lg flex items-center justify-center border-2 border-border flex-shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#a2774c]" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground text-sm sm:text-base">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                        Stock: {item.currentStock} {item.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Mínimo: {item.minStock} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRestock(item.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 transition-colors touch-manipulation"
                >
                  Reabastecer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-border rounded-xl font-medium text-card-foreground hover:bg-muted transition-colors touch-manipulation text-sm sm:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}