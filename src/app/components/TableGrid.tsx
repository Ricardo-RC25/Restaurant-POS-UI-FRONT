import { Table } from '../types';
import { Check, User, Receipt } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  onSelectTable: (tableNumber: number) => void;
}

export function TableGrid({ tables, onSelectTable }: TableGridProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      free: 'bg-green-100 dark:bg-green-900/30 border-green-600 dark:border-green-500 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/50',
      occupied: 'bg-red-100 dark:bg-red-900/30 border-red-600 dark:border-red-500 text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-900/50',
      billed: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-600 dark:border-yellow-500 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    };
    return colors[status as keyof typeof colors] || 'bg-card border-border';
  };

  const getStatusIcon = (table: Table) => {
    if (table.status === 'free') return null;
    if (table.status === 'occupied') return <User className="w-4 h-4" />;
    if (table.status === 'billed') return <Receipt className="w-4 h-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      free: 'Libre',
      occupied: 'Ocupada',
      billed: 'En cuenta',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 p-4 md:p-0">
      {tables.map((table) => (
        <button
          key={table.number}
          onClick={() => onSelectTable(table.number)}
          disabled={table.status !== 'free'}
          className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center font-medium transition-all shadow-sm active:scale-95 ${getStatusColor(table.status)} ${
            table.status !== 'free' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:shadow-md'
          }`}
        >
          <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
            {table.number}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
            {getStatusIcon(table)}
            <span>{getStatusLabel(table.status)}</span>
          </div>
          {table.waiterName ? (
            <div className="text-[9px] sm:text-xs mt-1 truncate max-w-full px-1 opacity-80">
              {table.waiterName}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
  }