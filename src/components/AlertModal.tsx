import { X, AlertCircle, CheckCircle, LogOut, LogIn } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'logout' | 'login-success';
}

export function AlertModal({ isOpen, onClose, onConfirm, type }: AlertModalProps) {
  if (!isOpen) return null;

  const configs = {
    'logout': {
      title: 'Cerrar Sesión',
      message: '¿Está seguro que desea cerrar la sesión?',
      icon: LogOut,
      color: 'red',
      confirmText: 'Cerrar Sesión',
    },
    'login-success': {
      title: 'Bienvenido',
      message: 'Has iniciado sesión correctamente',
      icon: CheckCircle,
      color: 'emerald',
      confirmText: 'Continuar',
    }
  };

  const config = configs[type];
  const colorClasses = {
    red: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100/30 dark:bg-red-900/30',
      alert: 'bg-red-50/50 dark:bg-red-900/10',
      text: 'text-red-700 dark:text-red-300',
      textSecondary: 'text-red-600/80 dark:text-red-400/80',
      button: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
    },
    emerald: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100/30 dark:bg-emerald-900/30',
      alert: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      textSecondary: 'text-emerald-600/80 dark:text-emerald-400/80',
      button: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
    }
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 
          transform transition-all duration-300 animate-in fade-in scale-95">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <config.icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {config.title}
              </h3>
            </div>
            {type === 'logout' && (
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-3 rounded-lg ${colors.alert}`}>
              <AlertCircle className={`h-5 w-5 mt-0.5 ${colors.icon}`} />
              <div>
                <p className={`text-sm font-medium ${colors.text}`}>
                  {type === 'logout' ? 'Confirmar Acción' : '¡Éxito!'}
                </p>
                <p className={`text-sm mt-1 ${colors.textSecondary}`}>
                  {config.message}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            {type === 'logout' && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white ${colors.button}
                rounded-lg transition-colors`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 