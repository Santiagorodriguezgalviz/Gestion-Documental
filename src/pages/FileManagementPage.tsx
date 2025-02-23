import { DataTable } from '../components/DataTable';
import { FileStack } from 'lucide-react';

export function FileManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 
            dark:from-emerald-500/5 dark:to-teal-500/5 rounded-2xl 
            ring-1 ring-emerald-500/20 dark:ring-emerald-400/10">
            <FileStack className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 
              dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Control de Archivos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestione los documentos y archivos del sistema
            </p>
          </div>
        </div>
      </div>
      <DataTable />
    </div>
  );
} 