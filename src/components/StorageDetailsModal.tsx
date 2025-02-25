import { X, Box, Folder, Book } from 'lucide-react';

interface StorageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageNumbers: {
    caja?: string;
    carpeta?: string;
    tomo?: string;
  };
}

export function StorageDetailsModal({ isOpen, onClose, storageNumbers }: StorageDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[0.5px]" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Detalles de Unidad de Conservación
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Caja */}
            {storageNumbers.caja && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Box className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Caja</h4>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {storageNumbers.caja}
                  </p>
                </div>
              </div>
            )}

            {/* Carpeta */}
            {storageNumbers.carpeta && (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Folder className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Carpeta</h4>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {storageNumbers.carpeta}
                  </p>
                </div>
              </div>
            )}

            {/* Tomo */}
            {storageNumbers.tomo && (
              <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Book className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300">Tomo</h4>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {storageNumbers.tomo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 