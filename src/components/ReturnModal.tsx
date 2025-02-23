import { FileText, X, CheckCircle } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
}

export function ReturnModal({ isOpen, onClose, onConfirm, fileName }: ReturnModalProps) {
  if (!isOpen) return null;

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
              <div className="p-2 bg-green-100/30 dark:bg-green-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Devolución de Documento
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Confirmar Devolución
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                  ¿Está seguro que desea marcar como devuelto el documento: <br />
                  <span className="font-medium">{fileName}</span>?
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                hover:bg-green-500 active:bg-green-700
                rounded-lg transition-colors"
            >
              Confirmar Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 