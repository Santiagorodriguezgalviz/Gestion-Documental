import { useState } from 'react';
import { FileText, X, AlertCircle } from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (borrowerName: string) => void;
  fileName: string;
}

export function BorrowModal({ isOpen, onClose, onConfirm, fileName }: BorrowModalProps) {
  const [borrowerName, setBorrowerName] = useState('');

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
              <div className="p-2 bg-blue-100/30 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Préstamo de Documento
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
            <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Información del Préstamo
                </p>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                  Está a punto de realizar el préstamo del documento: <br />
                  <span className="font-medium">{fileName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Solicitante
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 
                  border border-gray-200 dark:border-gray-700 rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 
                  focus:border-blue-500 dark:focus:border-blue-400
                  transition-all"
                placeholder="Ingrese el nombre del solicitante"
              />
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
              onClick={() => onConfirm(borrowerName)}
              disabled={!borrowerName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50
                disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 