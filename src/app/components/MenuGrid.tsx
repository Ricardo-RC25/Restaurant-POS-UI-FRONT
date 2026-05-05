import { MenuItem } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatCurrency } from '../utils/format';
import { Plus, AlertTriangle } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
}

export function MenuGrid({ items, onAddToOrder }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-4 md:p-0">
      {items.map((item) => {
        const isOutOfStock = item.stock === 0;
        const isLowStock = item.stock <= item.minStock && item.stock > 0;
        const isDisabled = isOutOfStock || !item.active;

        return (
          <div
            key={item.id}
            onClick={() => !isDisabled && onAddToOrder(item)}
            className={`bg-card rounded-2xl overflow-hidden shadow-md border border-border transition-all ${
              isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg cursor-pointer active:scale-98 hover:border-[#a2774c]'
            }`}
          >
            {/* Imagen del producto */}
            <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/70">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#a2774c] text-4xl font-bold">
                  {item.name.charAt(0)}
                </div>
              )}
              
              {isOutOfStock ? (
                <div className="absolute top-2 right-2 bg-[#e74c3c] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                  AGOTADO
                </div>
              ) : null}
              {isLowStock && !isOutOfStock ? (
                <div className="absolute top-2 right-2 bg-[#f39c12] text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  BAJO
                </div>
              ) : null}
            </div>

            {/* Información del producto */}
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground mb-1 line-clamp-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-[#6c5033] dark:text-[#d4a574]">
                  {formatCurrency(item.priceClient)}
                </p>
                <div
                  className={`rounded-full p-2 transition-all ${
                    isDisabled
                      ? 'bg-muted opacity-50'
                      : 'bg-[#2e636e] text-white shadow-md'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Stock: {item.stock} unidades
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}