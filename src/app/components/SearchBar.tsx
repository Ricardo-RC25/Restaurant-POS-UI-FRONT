import { Search } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Buscar...', 
  className = '' 
}: SearchBarProps) {
  // Render
  return (
    <div className={`bg-card rounded-lg shadow-sm p-4 border border-border ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border bg-input-background text-card-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground transition-colors"
        />
      </div>
    </div>
  );
}
