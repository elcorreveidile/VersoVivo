'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Toast types
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Toast Context
type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {mounted && <ToastViewport toasts={toasts} removeToast={removeToast} />}
    </ToastContext.Provider>
  );
}

// Hook to use toasts
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a Toaster provider');
  }
  return context;
}

// Toast Viewport Component
function ToastViewport({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[400px] w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Toast Item Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 300); // Wait for exit animation
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return 'border-green-500/30 bg-green-900/50';
      case 'error':
        return 'border-red-500/30 bg-red-900/50';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-900/50';
      case 'info':
        return 'border-blue-500/30 bg-blue-900/50';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getIcon = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm transition-all duration-300',
        getVariantStyles(toast.variant ?? 'default'),
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      {/* Icon */}
      {toast.variant && (
        <span className="flex-shrink-0 text-lg">{getIcon(toast.variant)}</span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-white mb-1">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-sm text-white/80">{toast.description}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onRemove, 300);
        }}
        className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-white/20 transition-all duration-300"
        style={{
          width: '100%',
          animation: `shrink ${toast.duration}ms linear`,
        }}
      />
    </div>
  );
}
