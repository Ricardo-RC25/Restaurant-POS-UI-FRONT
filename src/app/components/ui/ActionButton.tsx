/**
 * ACTION BUTTON COMPONENT
 * 
 * Botón estandarizado para acciones en el sistema
 * Soporta diferentes variantes y tamaños
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  title?: string;
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  type = 'button',
  disabled = false,
  className = '',
  title,
  fullWidth = false,
}: ActionButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#2e636e] text-white hover:bg-[#234d56] focus:ring-[#2e636e] shadow-sm hover:shadow-md',
    secondary: 'bg-[#a2774c] text-white hover:bg-[#8a6440] focus:ring-[#a2774c] shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    outline: 'bg-white border-2 border-[#e8e4df] text-[#6c5033] hover:bg-[#f8f6f3] hover:border-[#a2774c] focus:ring-[#a2774c]',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </button>
  );
}

/**
 * ICON BUTTON - Para botones de solo icono en tablas
 */
interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'edit' | 'delete' | 'view' | 'download' | 'neutral';
  title?: string;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  icon: Icon,
  onClick,
  variant = 'neutral',
  title,
  disabled = false,
  className = '',
}: IconButtonProps) {
  const variantStyles: Record<string, string> = {
    edit: 'text-primary hover:text-primary/80 hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20',
    delete: 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
    view: 'text-muted-foreground hover:text-card-foreground hover:bg-muted dark:hover:bg-muted/50',
    download: 'text-secondary hover:text-secondary/80 hover:bg-secondary/10 dark:hover:bg-secondary/20',
    neutral: 'text-muted-foreground hover:text-card-foreground hover:bg-muted dark:hover:bg-muted/50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}