import { OrderItem } from '../types';
import { X, Plus, Minus, Send } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { toast } from 'sonner';

interface CurrentOrderProps {
  items: OrderItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  checkoutLabel?: string;
}

export function CurrentOrder({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClear,
  checkoutLabel = 'Checkout',
}: CurrentOrderProps) {
  // Calcular subtotal incluyendo extras
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.priceClient;
    const extrasPrice = item.extras?.reduce((extraSum, extra) => extraSum + extra.price, 0) || 0;
    return sum + ((itemPrice + extrasPrice) * item.quantity);
  }, 0);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleClearOrder = () => {
    onClear();
    toast.success('Orden limpiada');
  };

  const handleRemoveItem = (index: number, itemName: string) => {
    onRemoveItem(index);
    toast.success(`${itemName} eliminado`);
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6 flex flex-col h-full border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-card-foreground">Orden Actual</h2>
        {items.length > 0 ? (
          <button
            onClick={handleClearOrder}
            className="text-sm text-[#e74c3c] hover:text-red-700 dark:hover:text-red-400 active:text-red-800 font-medium touch-manipulation"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 -mx-2 px-2">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm md:text-base">No hay productos en la orden</p>
          </div>
        ) : (
          items.map((item, itemIndex) => (
            <div key={`order-item-${item.id}-${itemIndex}`} className="border-b border-border pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-card-foreground text-sm md:text-base truncate">{item.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{formatCurrency(item.priceClient)}</p>
                  
                  {item.extras && item.extras.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {item.extras.map((extra, idx) => (
                        <div
                          key={`extra-${itemIndex}-${idx}`}
                          className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1"
                        >
                          <span>+</span>
                          <span>{extra.name}</span>
                          {extra.price > 0 && (
                            <span className="text-primary font-medium">
                              ({formatCurrency(extra.price)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  
                  {item.notes ? (
                    <p className="text-[10px] md:text-xs text-muted-foreground italic mt-1">
                      Nota: {item.notes}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => handleRemoveItem(itemIndex, item.name)}
                  className="text-[#e74c3c] hover:text-red-700 dark:hover:text-red-400 active:text-red-800 dark:active:text-red-300 ml-2 p-1 touch-manipulation"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(itemIndex, Math.max(1, item.quantity - 1))}
                  className="p-2 md:p-1.5 rounded-lg bg-muted hover:bg-muted/80 active:bg-muted/60 text-card-foreground touch-manipulation"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-card-foreground text-sm md:text-base">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(itemIndex, item.quantity + 1)}
                  className="p-2 md:p-1.5 rounded-lg bg-muted hover:bg-muted/80 active:bg-muted/60 text-card-foreground touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="ml-auto font-medium text-[#6c5033] dark:text-[#d4a574] text-sm md:text-base">
                  {formatCurrency((item.priceClient + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)) * item.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border dark:border-border pt-4 mt-4 space-y-2 flex-shrink-0">
        <div className="flex justify-between text-muted-foreground text-sm md:text-base">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground text-sm md:text-base">
          <span>IVA (8%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-base md:text-lg font-semibold text-[#6c5033] dark:text-[#d4a574] pt-2 border-t border-border dark:border-border">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="w-full mt-4 bg-[#2e636e] text-white py-3.5 md:py-3 rounded-xl font-medium text-base md:text-base hover:bg-[#a2774c] active:bg-[#8a6339] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0 touch-manipulation"
      >
        {checkoutLabel}
      </button>
    </div>
  );
}