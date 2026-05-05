import { X } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * FORM MODAL - Componente Modal Genérico
 * 
 * Modal estandarizado que se usa en todo el sistema.
 * Diseño basado en el modal de productos (el mejor diseño).
 */

interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function FormModal({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  submitDisabled = false,
  maxWidth = '2xl',
}: FormModalProps) {
  if (!isOpen) return null;

  const maxWidthClass = `sm:max-w-${maxWidth}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className={`bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full ${maxWidthClass} border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-border flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors touch-manipulation text-sm sm:text-base"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              className="flex-1 px-4 py-3 bg-[#a2774c] hover:bg-[#8b6640] text-white rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
