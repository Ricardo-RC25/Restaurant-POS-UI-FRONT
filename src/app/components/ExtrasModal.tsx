import { useState, useCallback, memo, useMemo } from 'react';
import { MenuItem } from '../types';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useApp } from '../context/AppContext';

interface ExtrasModalProps {
  item: MenuItem;
  onConfirm: (extras: Array<{ id: string; name: string; price: number }>, notes: string) => void;
  onClose: () => void;
}

export const ExtrasModal = memo(function ExtrasModal({ item, onConfirm, onClose }: ExtrasModalProps) {
  const { extras, categoryExtras, productExtras } = useApp();
  const [selectedExtras, setSelectedExtras] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [notes, setNotes] = useState('');

  // Filtrar extras disponibles para este producto según la lógica de negocio
  const availableExtras = useMemo(() => {
    return extras.filter(extra => {
      // Solo mostrar extras activos
      if (!extra.active) return false;

      // Si es global, mostrar para todos
      if (extra.applicationType === 'global') return true;

      // Si es por categoría, verificar si el producto pertenece a una de las categorías
      if (extra.applicationType === 'category') {
        const categoryExtraIds = categoryExtras.get(item.category) || [];
        return categoryExtraIds.includes(extra.id);
      }

      // Si es por producto, verificar si este producto está incluido
      if (extra.applicationType === 'product') {
        const productExtraIds = productExtras.get(item.id) || [];
        return productExtraIds.includes(extra.id);
      }

      return false;
    });
  }, [extras, categoryExtras, productExtras, item.category, item.id]);

  const toggleExtra = useCallback((extra: { id: string; name: string; price: number }) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(e => e.id === extra.id);
      if (isSelected) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  }, []);

  const isExtraSelected = useCallback((extraId: string) => {
    return selectedExtras.some(e => e.id === extraId);
  }, [selectedExtras]);

  // Calcular total con extras
  const totalWithExtras = useMemo(() => {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return item.priceClient + extrasTotal;
  }, [item.priceClient, selectedExtras]);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedExtras, notes);
  }, [selectedExtras, notes, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-accent">Personalizar Pedido</h2>
          <button onClick={onClose} className="text-primary hover:text-accent p-1 touch-manipulation">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Información del producto */}
          <div className="bg-muted rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-card-foreground mb-1 text-sm sm:text-base">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{formatCurrency(item.priceClient)}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
            )}
          </div>

          {/* Sección de Extras y Modificaciones */}
          {availableExtras.length > 0 ? (
            <div>
              <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-base sm:text-lg">✨</span>
                Extras y Modificaciones
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {availableExtras.map((extra) => {
                  const selected = isExtraSelected(extra.id);
                  return (
                    <label
                      key={extra.id}
                      className={`flex items-center justify-between gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                        selected
                          ? 'border-primary bg-primary/10 dark:bg-primary/20'
                          : 'border-border hover:border-primary/50 active:border-primary bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleExtra({ id: extra.id, name: extra.name, price: extra.price })}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <span className={`text-sm font-medium block ${selected ? 'text-primary' : 'text-card-foreground'}`}>
                            {extra.name}
                          </span>
                          {extra.description && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {extra.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-semibold whitespace-nowrap ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {extra.price > 0 ? `+${formatCurrency(extra.price)}` : 'Gratis'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No hay extras disponibles para este producto
              </p>
            </div>
          )}

          {/* Notas especiales */}
          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              📝 Notas especiales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: Sin sal, extra limón, bien cocido..."
              className="w-full px-4 py-3 border-2 border-border bg-card text-card-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Resumen de precio */}
          {selectedExtras.length > 0 && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border-2 border-primary/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-card-foreground">Producto base:</span>
                  <span className="font-medium text-card-foreground">{formatCurrency(item.priceClient)}</span>
                </div>
                {selectedExtras.map(extra => (
                  <div key={extra.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+ {extra.name}:</span>
                    <span className="font-medium text-muted-foreground">{formatCurrency(extra.price)}</span>
                  </div>
                ))}
                <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-card-foreground">Total:</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(totalWithExtras)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-4 sm:p-6 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            {selectedExtras.length > 0 
              ? `Agregar (${formatCurrency(totalWithExtras)})`
              : 'Agregar al Pedido'
            }
          </button>
        </div>
      </div>
    </div>
  );
});