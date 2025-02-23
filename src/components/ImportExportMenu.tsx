import React, { useState, useRef } from 'react';
import { FileSpreadsheet, FileUp, Calendar, FileDown, X, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { useFileStore } from '../store/fileStore';
import { FileRecord } from '../types';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { fileService } from '../services/fileService';

interface ImportExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportExportMenu({ isOpen, onClose }: ImportExportMenuProps) {
  const [year, setYear] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    try {
      exportToExcel(files, year ? parseInt(year) : undefined);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Por favor, intente nuevamente.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(files, year ? parseInt(year) : undefined);
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Error al exportar a PDF. Por favor, intente nuevamente.');
    }
  };

  const processExcelData = (jsonData: unknown[]): Omit<FileRecord, 'id'>[] => {
    return (jsonData as Record<string, string>[]).map(row => ({
      itemNumber: Number(row['No. ITEM']) || 0,
      code: row['CÓDIGO'] || '',
      name: row['NOMBRE DE LAS SERIES'] || '',
      startDate: row['FECHA INICIAL'] || undefined,
      endDate: row['FECHA FINAL'] || undefined,
      storageUnit: (row['UNIDAD DE CONSERVACIÓN'] || 'CARPETA') as FileRecord['storageUnit'],
      folioStart: Number(row['FOLIO INICIAL']) || 1,
      folioEnd: Number(row['FOLIO FINAL']) || 1,
      support: row['SOPORTE'] || 'PAPEL',
      status: 'DISPONIBLE' as const,
      block: row['BLOQUE'] || '',
      shelf: row['ENTREPAÑO'] || ''
    }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setImportError('');

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[];
          
          const processedData = processExcelData(jsonData);

          // Guardar cada registro en Firebase
          for (const record of processedData) {
            await fileService.addFile(record);
          }

          // Recargar los datos
          const updatedFiles = await fileService.getFiles();
          setFiles(updatedFiles);

          alert('Archivos importados correctamente');
          onClose();
        } catch (error) {
          console.error('Error procesando archivo:', error);
          setImportError('Error al procesar el archivo. Verifique el formato.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error al importar:', error);
      setImportError('Error al importar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md 
          transform transition-all duration-300 animate-in fade-in scale-95">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Importar/Exportar Registros
            </h3>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Importar sección */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Importar desde Excel
              </h4>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".xlsx,.xls"
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 
                    border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl
                    hover:border-emerald-500 dark:hover:border-emerald-500
                    transition-all duration-300 group
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileUp className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-500">
                    {isLoading ? 'Importando...' : 'Seleccionar Archivo'}
                  </span>
                </button>
              </div>
              {importError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {/* Exportar sección */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Exportar Registros
              </h4>
              <div className="relative">
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Año para filtrar (opcional)"
                  className="w-full px-4 py-2.5 pl-10 border-2 border-gray-300 dark:border-gray-600 
                    rounded-xl focus:ring-emerald-500 focus:border-emerald-500 
                    dark:bg-gray-800 dark:text-white transition-all"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
                  text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 
                    bg-emerald-50 dark:bg-emerald-900/20 rounded-xl
                    hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                    transition-colors group"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Excel
                  </span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 
                    bg-red-50 dark:bg-red-900/20 rounded-xl
                    hover:bg-red-100 dark:hover:bg-red-900/30
                    transition-colors group"
                >
                  <FileDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    PDF
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 