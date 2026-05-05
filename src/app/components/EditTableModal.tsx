import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface EditTableModalProps {
  table: {
    number: number;
    status: string;
  };
  onClose: () => void;
  onSave: (tableNumber: number, newNumber: number) => void;
}

export function EditTableModal({ table, onClose, onSave }: EditTableModalProps) {
  const [newNumber, setNewNumber] = useState(table.number);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(table.number, newNumber);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Editar Mesa #{table.number}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Número de Mesa *
              </label>
              <input
                type="number"
                min="1"
                value={newNumber}
                onChange={(e) => setNewNumber(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base bg-background text-card-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Cambia el número de esta mesa
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 sm:p-6 border-t border-border flex-shrink-0">
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