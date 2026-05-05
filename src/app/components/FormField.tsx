import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * FORM FIELD COMPONENTS
 * 
 * Componentes de campos de formulario estandarizados
 */

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, helpText, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-card-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

interface InputFieldProps {
  icon?: LucideIcon;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string;
  disabled?: boolean;
}

export function InputField({
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  min,
  max,
  step,
  disabled,
}: InputFieldProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground transition-colors ${
          error ? 'border-red-500 dark:border-red-600' : 'border-border'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: TextAreaFieldProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground resize-none transition-colors ${
        error ? 'border-red-500 dark:border-red-600' : 'border-border'
      }`}
    />
  );
}

interface SelectFieldProps {
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: boolean;
  disabled?: boolean;
}

export function SelectField({
  icon: Icon,
  value,
  onChange,
  options,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground appearance-none cursor-pointer transition-colors ${
          error ? 'border-red-500 dark:border-red-600' : 'border-border'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function CheckboxField({ checked, onChange, label, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      <div className="flex-1">
        <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}
