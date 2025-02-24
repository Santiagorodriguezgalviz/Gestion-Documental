import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const toastStyles = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'shadow-emerald-100/50 dark:shadow-emerald-500/10'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-100 dark:border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    shadow: 'shadow-red-100/50 dark:shadow-red-500/10'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-100 dark:border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    shadow: 'shadow-yellow-100/50 dark:shadow-yellow-500/10'
  }
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const styles = toastStyles[type];
  const Icon = styles.icon;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const toast = (
    <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-2 fade-in">
      <div 
        className={`
          flex items-center gap-3 px-4 py-3 
          rounded-xl border backdrop-blur-sm
          shadow-lg transition-all duration-300
          ${styles.bg} ${styles.border} ${styles.shadow}
        `}
      >
        <div className={`${styles.text} animate-bounce`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <p className={`text-sm font-medium ${styles.text}`}>
            {type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : 'Atención'}
          </p>
          <p className={`text-sm mt-0.5 ${styles.text} opacity-90`}>
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`
            p-1.5 rounded-lg transition-colors
            hover:bg-black/5 dark:hover:bg-white/5 
            ${styles.text}
          `}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
          <div 
            className={`h-full ${styles.text} opacity-20`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
} 