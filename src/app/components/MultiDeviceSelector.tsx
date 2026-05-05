import { ReactNode } from 'react';

// ============================================================================
// INTERFACES
// ============================================================================

interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PageHeader({ breadcrumb, title, subtitle, icon, actions }: PageHeaderProps) {
  // Render
  return (
    <header 
      className="bg-card border-b border-border px-6 shadow-sm flex-shrink-0 flex items-center justify-between" 
      style={{ height: '96px' }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-primary">{icon}</div>
        )}
        <div>
          {breadcrumb && (
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </header>
  );
}