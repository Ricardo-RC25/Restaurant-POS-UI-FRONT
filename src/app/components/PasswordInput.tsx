import { useState } from 'react';

import { Eye, EyeOff, Lock } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PasswordInput({ 
  value, 
  onChange, 
  placeholder = 'Ingresa tu contraseña',
  label = 'Contraseña',
  required = false,
  autoFocus = false,
  className = ''
}: PasswordInputProps) {
  // Estados
  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Render
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-input-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
          required={required}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors focus:outline-none"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
