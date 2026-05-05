import { ReactNode } from 'react';

// ============================================================================
// INTERFACES
// ============================================================================

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'full' | 'container';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PageLayout({ children, title, subtitle, maxWidth = 'full' }: PageLayoutProps) {
  // Render
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className={`${maxWidth === 'container' ? 'max-w-7xl mx-auto' : ''} p-4 sm:p-6 md:p-8`}>
          {(title || subtitle) && (
            <div className="mb-6 md:mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}