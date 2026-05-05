import { Check } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface TableSelectorProps {
  selectedTable: number | null;
  onSelectTable: (tableNumber: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TableSelector({ selectedTable, onSelectTable }: TableSelectorProps) {
  // Estados derivados
  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  // Render
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
      <h2 className="text-lg font-semibold text-accent mb-4">Seleccionar Mesa</h2>
      
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {tables.map((tableNumber) => (
          <button
            key={tableNumber}
            onClick={() => onSelectTable(tableNumber)}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center font-medium transition-colors ${
              selectedTable === tableNumber
                ? 'bg-secondary border-secondary text-white'
                : 'bg-card border-border text-card-foreground hover:border-primary'
            }`}
          >
            {selectedTable === tableNumber ? (
              <Check className="w-5 h-5" />
            ) : (
              tableNumber
            )}
          </button>
        ))}
      </div>
    </div>
  );
}