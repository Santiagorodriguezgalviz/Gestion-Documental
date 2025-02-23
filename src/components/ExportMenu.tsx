import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar } from 'lucide-react';
import { useFloating, useInteractions, useClick, useRole, useDismiss, FloatingFocusManager, useId, offset, flip, shift } from '@floating-ui/react';

interface ExportMenuProps {
  onExport: (type: 'excel' | 'pdf', year?: number) => void;
}

export function ExportMenu({ onExport }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState<string>('');

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

  const handleExport = (type: 'excel' | 'pdf') => {
    onExport(type, year ? parseInt(year) : undefined);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <Download size={20} />
        Exportar
      </button>

      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in zoom-in duration-200"
          >
            <h2 id={headingId} className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Exportar Registros
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Año para filtrar (opcional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Download size={18} />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </div>
  );
}