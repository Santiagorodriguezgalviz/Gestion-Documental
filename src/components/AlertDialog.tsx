import { AlertTriangle, AlertCircle, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'delete' | 'logout';
}

export function AlertDialog({ isOpen, onClose, onConfirm, title, message, type }: AlertDialogProps) {
  if (!isOpen) return null;

  const Icon = type === 'logout' ? LogOut : type === 'delete' ? AlertTriangle : AlertCircle;
  const color = type === 'delete' || type === 'logout' ? 'red' : 'emerald';

  const dialog = (
    <div className="fixed inset-0 isolate z-[9999]">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl 
          transform transition-all duration-300 animate-in fade-in scale-95">
          <div className="p-6">
            {/* Icono y Título */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 bg-${color}-100/30 dark:bg-${color}-900/30 rounded-lg`}>
                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            </div>

            {/* Mensaje */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>

            {/* Botones */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white 
                  bg-${color}-600 hover:bg-${color}-500 rounded-lg transition-colors`}
              >
                {type === 'logout' ? 'Cerrar Sesión' : type === 'delete' ? 'Confirmar' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Usar createPortal para montar el diálogo en el root del documento
  return createPortal(dialog, document.body);
} 