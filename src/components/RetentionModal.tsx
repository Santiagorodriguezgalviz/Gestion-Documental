import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface RetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (retentionReason: string) => void;
  isRetained: boolean;
}

export function RetentionModal({ isOpen, onClose, onConfirm, isRetained }: RetentionModalProps) {
  const [retentionReason, setRetentionReason] = useState('');
  const [isRetaining, setIsRetaining] = useState(isRetained);

  // Resetear los estados cuando el modal se abre o cambia isRetained
  useEffect(() => {
    if (isOpen) {
      setIsRetaining(isRetained);
      setRetentionReason('');
    }
  }, [isOpen, isRetained]);

  // Función para manejar el cierre y limpiar
  const handleClose = () => {
    setRetentionReason('');
    onClose();
  };

  // Función para manejar la confirmación y limpiar
  const handleConfirm = () => {
    onConfirm(isRetaining ? retentionReason : '');
    setRetentionReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[0.5px]" onClick={handleClose} />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Estado de Retención
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRetaining}
                  onChange={(e) => setIsRetaining(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer 
                  dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                  after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {isRetaining ? 'Archivo Retenido' : 'Archivo Disponible'}
                </span>
              </label>
            </div>

            {isRetaining && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Motivo de Retención
                </label>
                <textarea
                  value={retentionReason}
                  onChange={(e) => setRetentionReason(e.target.value)}
                  placeholder="Describa el motivo de la retención (opcional)..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                    transition-all"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 
            flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 
                hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 
                hover:bg-emerald-500 rounded-lg transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 