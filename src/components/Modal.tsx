import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: string;
  iconVariant?: 'primary' | 'error' | 'info' | 'secondary';
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-modal-sm', // ~440px
  md: 'max-w-modal-md', // ~540px
  lg: 'max-w-modal-lg', // ~720px
  xl: 'max-w-modal-xl', // ~900px
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  icon,
  iconVariant = 'primary',
  closeOnOutsideClick = true,
  closeOnEsc = true,
  ariaLabel,
}) => {
  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const iconBgClasses = {
    primary: 'bg-primary-container/30 text-primary',
    error: 'bg-error-container/30 text-error',
    info: 'bg-surface-container-high text-on-surface-variant',
    secondary: 'bg-secondary-container/30 text-secondary',
  }[iconVariant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeOnOutsideClick ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || (typeof title === 'string' ? title : 'Dialog')}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className={`bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col overflow-hidden relative my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || icon) && (
              <div className="flex items-start justify-between p-lg border-b border-outline-variant/40 shrink-0 gap-md">
                <div className="flex items-center gap-md min-w-0 flex-1">
                  {icon && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgClasses}`}>
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2 className="font-headline-sm text-on-surface truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="font-body-sm text-on-surface-variant text-[13px] mt-xs">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0 cursor-pointer"
                  aria-label="Close dialog"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-lg overflow-y-auto flex-1 text-on-surface font-body-md leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-lg border-t border-outline-variant/40 bg-surface-container-low/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-sm shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
