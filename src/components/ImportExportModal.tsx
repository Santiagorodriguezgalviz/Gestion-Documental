import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Download, Upload, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  onExport: (type: 'excel' | 'pdf', year?: string) => void;
}

export function ImportExportModal({ isOpen, onClose, onImport, onExport }: ImportExportModalProps) {
  const [year, setYear] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Limpiar el año cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setYear('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    // Datos de ejemplo más descriptivos
    const data = [
      {
        'NO. ITEM': '1',
        'CÓDIGO': 'DOC001',
        'NOMBRE DE LAS SERIES': 'Actas de Reunión',
        'FECHA INICIAL': '2024-01-01',
        'FECHA FINAL': '2024-12-31',
        'BLOQUE': 'A1',
        'ENTREPAÑO': 'E1',
        'UNIDAD DE CONSERVACIÓN': 'CARPETA',
        'SOPORTE': 'PAPEL'
      },
      {
        'NO. ITEM': '2',
        'CÓDIGO': 'DOC002',
        'NOMBRE DE LAS SERIES': 'Correspondencia Interna',
        'FECHA INICIAL': '2024-02-01',
        'FECHA FINAL': '2024-12-31',
        'BLOQUE': 'B2',
        'ENTREPAÑO': 'E3',
        'UNIDAD DE CONSERVACIÓN': 'TOMO',
        'SOPORTE': 'PAPEL'
      },
      {
        'NO. ITEM': '3',
        'CÓDIGO': 'DOC003',
        'NOMBRE DE LAS SERIES': 'Informes de Gestión',
        'FECHA INICIAL': '2024-03-01',
        'FECHA FINAL': '2024-12-31',
        'BLOQUE': 'C1',
        'ENTREPAÑO': 'E2',
        'UNIDAD DE CONSERVACIÓN': 'CAJA',
        'SOPORTE': 'PAPEL'
      }
    ];

    // Crear una nueva hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data, {
      header: [
        'NO. ITEM',
        'CÓDIGO',
        'NOMBRE DE LAS SERIES',
        'FECHA INICIAL',
        'FECHA FINAL',
        'BLOQUE',
        'ENTREPAÑO',
        'UNIDAD DE CONSERVACIÓN',
        'SOPORTE'
      ]
    });

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 10 },  // NO. ITEM
      { wch: 15 },  // CÓDIGO
      { wch: 40 },  // NOMBRE DE LAS SERIES
      { wch: 15 },  // FECHA INICIAL
      { wch: 15 },  // FECHA FINAL
      { wch: 10 },  // BLOQUE
      { wch: 12 },  // ENTREPAÑO
      { wch: 25 },  // UNIDAD DE CONSERVACIÓN
      { wch: 15 }   // SOPORTE
    ];
    ws['!cols'] = colWidths;

    // Agregar validaciones y notas
    const validations = {
      'UNIDAD DE CONSERVACIÓN': ['CARPETA', 'CAJA', 'TOMO'],
      'SOPORTE': ['PAPEL', 'DIGITAL', 'CD', 'DVD']
    };

    // Agregar comentarios/notas a las celdas
    ws.A1.c = [{ a: "Autor", t: "Número secuencial del registro" }];
    ws.B1.c = [{ a: "Autor", t: "Código único del documento" }];
    ws.C1.c = [{ a: "Autor", t: "Nombre descriptivo de la serie documental" }];
    ws.D1.c = [{ a: "Autor", t: "Formato: YYYY-MM-DD" }];
    ws.E1.c = [{ a: "Autor", t: "Formato: YYYY-MM-DD" }];
    ws.F1.c = [{ a: "Autor", t: "Identificador del bloque (ej: A1, B2, C3)" }];
    ws.G1.c = [{ a: "Autor", t: "Identificador del entrepaño (ej: E1, E2, E3)" }];
    ws.H1.c = [{ a: "Autor", t: "Valores permitidos: CARPETA, CAJA, TOMO" }];
    ws.I1.c = [{ a: "Autor", t: "Valores permitidos: PAPEL, DIGITAL, CD, DVD" }];

    // Crear libro de trabajo y agregar la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

    // Agregar hoja de instrucciones
    const instructionsData = [
      ["INSTRUCCIONES DE USO"],
      [""],
      ["1. No modifique los encabezados de las columnas"],
      ["2. Respete los formatos de fecha (YYYY-MM-DD)"],
      ["3. Use los valores permitidos para:"],
      ["   - UNIDAD DE CONSERVACIÓN: CARPETA, CAJA, TOMO"],
      ["   - SOPORTE: PAPEL, DIGITAL, CD, DVD"],
      ["4. El NO. ITEM debe ser único y numérico"],
      ["5. Todos los campos son obligatorios"],
      ["6. Puede agregar tantas filas como necesite"],
      ["7. Guarde el archivo en formato .xlsx antes de importar"]
    ];
    
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instrucciones");

    // Guardar el archivo
    XLSX.writeFile(wb, "plantilla_importacion.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Importar/Exportar Registros
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Sección de Importación */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Importar desde Excel
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Utiliza nuestra plantilla para importar múltiples registros de manera masiva
              </p>
              
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 
                  hover:text-emerald-500 dark:hover:text-emerald-300 mb-4 group w-full
                  border border-emerald-200 dark:border-emerald-800 rounded-lg p-3
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <Download className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                <span className="font-medium">Descargar Plantilla de Excel</span>
              </button>

              <div 
                className={`relative border-2 border-dashed rounded-xl p-8
                  ${dragActive 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                  } transition-all duration-200 group cursor-pointer`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file) onImport(file);
                }}
              >
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
                  accept=".xlsx,.xls,.csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                    flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                      Importación Masiva de Registros
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Arrastra tu archivo Excel o haz clic para seleccionar
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Formatos soportados: XLSX, XLS, CSV</span>
                    </div>
                  </div>
                </div>

                {/* Líneas decorativas en las esquinas */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Mensaje de ayuda */}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="inline-block p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                Asegúrate de usar la plantilla proporcionada para evitar errores en la importación
              </p>
            </div>

            {/* Sección de Exportación */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Exportar Registros
              </h4>
              
              <div className="relative mb-4">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Año para filtrar (opcional)"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg
                    bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-gray-100 placeholder-gray-500
                    focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onExport('excel', year);
                    setYear(''); // Limpiar después de exportar
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5
                    bg-emerald-50 dark:bg-emerald-500/10 
                    hover:bg-emerald-100 dark:hover:bg-emerald-500/20
                    text-emerald-600 dark:text-emerald-400
                    rounded-lg transition-colors group"
                >
                  <FileSpreadsheet className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Excel
                </button>
                <button
                  onClick={() => {
                    onExport('pdf', year);
                    setYear(''); // Limpiar después de exportar
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5
                    bg-red-50 dark:bg-red-500/10 
                    hover:bg-red-100 dark:hover:bg-red-500/20
                    text-red-600 dark:text-red-400
                    rounded-lg transition-colors group"
                >
                  <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 