import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { FileRecord } from '../types';
import { useFileStore } from '../store/fileStore';
import { FolderOpen, Pencil, Trash2, Plus, Calendar, Download, Grid, LayoutGrid, Search, RefreshCw, ChevronDown, Check, ChevronUp, ChevronLeft, ChevronRight, Box, Folder, Book, Info } from 'lucide-react';
import { FileModal } from './FileModal';
import { ImportExportMenu } from './ImportExportMenu';
import { BorrowModal } from './BorrowModal';
import { ReturnModal } from './ReturnModal';
import { fileService } from '../services/fileService';
import { AlertDialog } from './AlertDialog';
import { Toast, ToastType } from './Toast';
import * as Select from '@radix-ui/react-select';
import React from 'react';
import { ImportExportModal } from './ImportExportModal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as Popover from '@radix-ui/react-popover';

interface ExportData {
  'NO. ITEM': number;
  'CÓDIGO': string;
  'NOMBRE DE LAS SERIES': string;
  'FECHA INICIAL': string;
  'FECHA FINAL': string;
  'BLOQUE': string;
  'ENTREPAÑO': string;
  'UNIDAD DE CONSERVACIÓN': string;
  'SOPORTE': string;
  'ESTADO': string;
  'PRESTADO A': string;
}

// Agregar la definición de tipo para autoTable
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    head: string[][];
    body: (string | number)[][];
    startY: number;
    styles: object;
    headStyles: object;
    alternateRowStyles: object;
    margin: { top: number };
  }) => void;
}

const columnHelper = createColumnHelper<FileRecord>();

export function DataTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<FileRecord | undefined>();
  const [globalFilter, setGlobalFilter] = useState('');
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'delete';
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: () => {}
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  
  const files = useFileStore((state) => state.files);
  const filters = useFileStore((state) => state.filters);
  const setFilter = useFileStore((state) => state.setFilter);
  const clearFilters = useFileStore((state) => state.clearFilters);
  const setFiles = useFileStore((state) => state.setFiles);

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="px-1">
          <label className="relative inline-flex items-center justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="peer h-5 w-5 appearance-none rounded-md border-2 
                border-gray-300 dark:border-gray-600
                checked:border-emerald-500 dark:checked:border-emerald-500
                checked:bg-emerald-500 dark:checked:bg-emerald-500
                hover:border-emerald-400 dark:hover:border-emerald-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                dark:focus:ring-emerald-500/20 transition-all duration-200
                cursor-pointer"
            />
            <svg
              className="absolute h-4 w-4 pointer-events-none opacity-0 
                peer-checked:opacity-100 text-white transition-opacity duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </label>
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <label className="relative inline-flex items-center justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="peer h-5 w-5 appearance-none rounded-md border-2 
                border-gray-300 dark:border-gray-600
                checked:border-emerald-500 dark:checked:border-emerald-500
                checked:bg-emerald-500 dark:checked:bg-emerald-500
                hover:border-emerald-400 dark:hover:border-emerald-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                dark:focus:ring-emerald-500/20 transition-all duration-200
                cursor-pointer"
            />
            <svg
              className="absolute h-4 w-4 pointer-events-none opacity-0 
                peer-checked:opacity-100 text-white transition-opacity duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </label>
        </div>
      ),
    }),
    columnHelper.accessor('itemNumber', {
      header: 'NO. ITEM',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('code', {
      header: 'CÓDIGO',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('name', {
      header: 'NOMBRE DE LAS SERIES',
      cell: (info) => info.getValue(),
    }),
        columnHelper.accessor('startDate', {
      header: 'FECHA INICIAL',
          cell: (info) => (
            <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
              <span>{formatDate(info.getValue())}</span>
            </div>
          ),
        }),
        columnHelper.accessor('endDate', {
      header: 'FECHA FINAL',
          cell: (info) => (
            <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
              <span>{formatDate(info.getValue())}</span>
            </div>
      ),
    }),
    columnHelper.accessor('block', {
      header: 'BLOQUE',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Grid size={14} className="text-gray-400 dark:text-gray-500" />
          <span>{info.getValue() || '-'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('shelf', {
      header: 'ENTREPAÑO',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-gray-400 dark:text-gray-500" />
          <span>{info.getValue() || '-'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('storageUnit', {
      header: 'UNIDAD DE CONSERVACIÓN',
      cell: (info) => (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 
              bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 
              dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
              <Box className="h-4 w-4" />
              Ver detalles
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="z-50 w-72 rounded-lg bg-white dark:bg-gray-800 shadow-lg 
                ring-1 ring-black/5 dark:ring-white/5 p-4 animate-in 
                zoom-in-95 duration-200"
              sideOffset={5}
            >
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Detalles de Conservación
                </h3>
                
                <div className="space-y-2">
                  {info.row.original.boxNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Box className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Caja: {info.row.original.boxNumber}
                      </span>
                    </div>
                  )}
                  
                  {info.row.original.folderNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Carpeta: {info.row.original.folderNumber}
                      </span>
                    </div>
                  )}
                  
                  {info.row.original.volumeNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Book className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Tomo: {info.row.original.volumeNumber}
                      </span>
                    </div>
                  )}

                  {/* Si no hay ningún dato, mostrar mensaje */}
                  {!info.row.original.boxNumber && 
                   !info.row.original.folderNumber && 
                   !info.row.original.volumeNumber && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No hay detalles adicionales
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Tipo principal: {info.row.original.storageUnit}
                </div>
              </div>

              <Popover.Arrow className="fill-white dark:fill-gray-800" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ),
    }),
    columnHelper.accessor('support', {
      header: 'SOPORTE',
      cell: (info) => (
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'ESTADO',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          info.getValue() === 'PRESTADO' 
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' 
            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('borrowedTo', {
      header: 'PRESTADO A',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACCIONES',
      cell: (info) => {
        const file = info.row.original;
        const isPrestado = file.status === 'PRESTADO';

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(file)}
              className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => isPrestado ? handleReturn(file) : handleBorrow(file)}
              className={`p-2 transition-colors ${
                isPrestado 
                  ? 'text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300' 
                  : 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
              }`}
              title={isPrestado ? "Marcar como devuelto" : "Prestar"}
            >
              <FolderOpen className="h-4 w-4" />
            </button>
          <button
              onClick={() => handleDelete(file)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar"
          >
              <Trash2 className="h-4 w-4" />
          </button>
        </div>
        );
      },
    }),
  ];

  const filteredData = useMemo(() => {
    return useFileStore.getState().filteredFiles();
  }, [files, filters]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const filesData = await fileService.getFiles();
        setFiles(filesData);
      } catch {
        setToast({
          show: true,
          message: 'Error al cargar los archivos. Por favor, recargue la página.',
          type: 'error'
        });
      }
    };

    loadFiles();
  }, [setFiles]);

  const handleBorrow = (file: FileRecord) => {
    if (file.status === 'PRESTADO') {
      setAlert({
        show: true,
        title: 'Archivo ya prestado',
        message: `El archivo "${file.name}" ya se encuentra prestado a ${file.borrowedTo}. ¿Desea marcarlo como devuelto?`,
        type: 'warning',
        onConfirm: () => {
          setSelectedFile(file);
          setReturnModalOpen(true);
        }
      });
    } else {
      setSelectedFile(file);
      setBorrowModalOpen(true);
    }
  };

  const handleReturn = (file: FileRecord) => {
    setSelectedFile(file);
    setReturnModalOpen(true);
  };

  const handleEdit = (file: FileRecord) => {
    setFileToEdit(file);
    setIsModalOpen(true);
  };

  const handleDelete = (file: FileRecord) => {
    setAlert({
      show: true,
      title: 'Confirmar Eliminación',
      message: '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.',
      type: 'delete',
      onConfirm: async () => {
        try {
          await fileService.deleteFile(file.id);
          const updatedFiles = await fileService.getFiles();
          setFiles(updatedFiles);
          setToast({
            show: true,
            message: 'Registro eliminado correctamente',
            type: 'success'
          });
        } catch (error) {
          console.error('Error al eliminar:', error);
          setToast({
            show: true,
            message: 'Error al eliminar el registro',
            type: 'error'
          });
        }
      }
    });
  };

  const handleAddNew = useCallback(() => {
    setFileToEdit(undefined);
    setIsModalOpen(true);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleBorrowConfirm = async (borrowerName: string) => {
    try {
      if (selectedFile) {
        await fileService.updateFileStatus(selectedFile.id, 'PRESTADO', borrowerName);
        const updatedFiles = await fileService.getFiles();
        setFiles(updatedFiles);
        setBorrowModalOpen(false);
        setSelectedFile(null);
        setToast({
          show: true,
          message: 'Préstamo registrado correctamente',
          type: 'success'
        });
      }
    } catch {
      setToast({
        show: true,
        message: 'Error al registrar el préstamo',
        type: 'error'
      });
    }
  };

  const handleReturnConfirm = async () => {
    try {
      if (selectedFile) {
        await fileService.updateFileStatus(selectedFile.id, 'DISPONIBLE');
        const updatedFiles = await fileService.getFiles();
        setFiles(updatedFiles);
        setReturnModalOpen(false);
        setSelectedFile(null);
        setToast({
          show: true,
          message: 'Archivo devuelto correctamente',
          type: 'success'
        });
      }
    } catch {
      setToast({
        show: true,
        message: 'Error al devolver el archivo. Por favor, intente nuevamente.',
        type: 'error'
      });
    }
  };

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setGlobalFilter('');
    // Limpiar los inputs de filtro
    const filterInputs = document.querySelectorAll('input[type="text"]');
    filterInputs.forEach(input => (input as HTMLInputElement).value = '');
    // Resetear los selects
    const filterSelects = document.querySelectorAll('select');
    filterSelects.forEach(select => select.selectedIndex = 0);
  }, [clearFilters]);

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(index => 
      filteredData[parseInt(index)].id
    );

    if (selectedIds.length === 0) return;

    setAlert({
      show: true,
      title: 'Confirmar Eliminación Múltiple',
      message: `¿Está seguro de eliminar ${selectedIds.length} registros? Esta acción no se puede deshacer.`,
      type: 'delete',
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => fileService.deleteFile(id)));
          const updatedFiles = await fileService.getFiles();
          setFiles(updatedFiles);
          setRowSelection({});
          setAlert({
            show: true,
            title: 'Éxito',
            message: 'Los registros han sido eliminados correctamente.',
            type: 'success',
            onConfirm: () => setAlert(prev => ({ ...prev, show: false }))
          });
        } catch {
          setAlert({
            show: true,
            title: 'Error',
            message: 'Ha ocurrido un error al eliminar los registros.',
            type: 'error',
            onConfirm: () => setAlert(prev => ({ ...prev, show: false }))
          });
        }
      }
    });
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: true,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  // Funciones para manejar importación/exportación
  const handleImport = async (file: File) => {
    try {
      console.log('Archivo a importar:', file);
      // TODO: Implementar lógica de importación
      setToast({
        show: true,
        message: 'Archivo importado correctamente',
        type: 'success'
      });
      setIsImportExportModalOpen(false);
    } catch (error) {
      console.error('Error al importar:', error);
      setToast({
        show: true,
        message: 'Error al importar el archivo',
        type: 'error'
      });
    }
  };

  const handleExport = (type: 'excel' | 'pdf', year?: string) => {
    try {
      // Filtrar los datos por año si se especifica
      let dataToExport = files;
      if (year) {
        dataToExport = files.filter(file => {
          const fileYear = file.startDate ? new Date(file.startDate).getFullYear().toString() : '';
          return fileYear === year;
        });
      }

      // Preparar los datos para exportar
      const exportData: ExportData[] = dataToExport.map((file, index) => ({
        'NO. ITEM': index + 1,
        'CÓDIGO': file.code || '-',
        'NOMBRE DE LAS SERIES': file.name,
        'FECHA INICIAL': formatDate(file.startDate),
        'FECHA FINAL': formatDate(file.endDate),
        'BLOQUE': file.block || '-',
        'ENTREPAÑO': file.shelf || '-',
        'UNIDAD DE CONSERVACIÓN': file.storageUnit,
        'SOPORTE': file.support,
        'ESTADO': file.status,
        'PRESTADO A': file.borrowedTo || '-'
      }));

      if (type === 'excel') {
        // Crear una nueva hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustar anchos de columna
        const colWidths = [
          { wch: 8 },   // NO. ITEM
          { wch: 12 },  // CÓDIGO
          { wch: 40 },  // NOMBRE DE LAS SERIES
          { wch: 15 },  // FECHA INICIAL
          { wch: 15 },  // FECHA FINAL
          { wch: 10 },  // BLOQUE
          { wch: 12 },  // ENTREPAÑO
          { wch: 25 },  // UNIDAD DE CONSERVACIÓN
          { wch: 12 },  // SOPORTE
          { wch: 15 },  // ESTADO
          { wch: 20 }   // PRESTADO A
        ];
        ws['!cols'] = colWidths;

        // Crear libro de trabajo y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");

        // Generar el nombre del archivo
        const fileName = year 
          ? `registros_${year}.xlsx`
          : 'todos_los_registros.xlsx';

        // Guardar el archivo
        XLSX.writeFile(wb, fileName);

      } else if (type === 'pdf') {
        // Crear nuevo documento PDF
        const doc = new jsPDF();

        // Agregar título
        const title = year 
          ? `Registros del Año ${year}`
          : 'Todos los Registros';
        
        doc.setFontSize(16);
        doc.text(title, 14, 15);

        // Agregar fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Generado el ${new Date().toLocaleDateString('es-ES')}`,
          14, 
          22
        );

        // Configurar la tabla
        (doc as JsPDFWithAutoTable).autoTable({
          head: [Object.keys(exportData[0])],
          body: exportData.map(Object.values),
          startY: 30,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [0, 150, 136],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: { top: 30 },
        });

        // Generar el nombre del archivo
        const fileName = year 
          ? `registros_${year}.pdf`
          : 'todos_los_registros.pdf';

        // Guardar el archivo
        doc.save(fileName);
      }

      // Mostrar mensaje de éxito
      setToast({
        show: true,
        message: `Archivo ${type.toUpperCase()} exportado correctamente${year ? ` para el año ${year}` : ''}`,
        type: 'success'
      });

    } catch (error) {
      console.error('Error al exportar:', error);
      setToast({
        show: true,
        message: 'Error al exportar el archivo',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
        {/* Search and Actions Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 w-full">
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Buscar en todos los campos..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500
                    transition-colors"
                />
          </div>
        </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Botón de eliminar seleccionados */}
              {Object.keys(rowSelection).length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                    text-white bg-red-600 hover:bg-red-500 rounded-lg
                    shadow-lg shadow-red-600/10 dark:shadow-red-900/20 
                    transition-all duration-200 group"
                >
                  <div className="relative">
                    <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center 
                      justify-center rounded-full bg-red-700 text-xs animate-pulse">
                      {Object.keys(rowSelection).length}
                    </span>
                  </div>
                  <span>
                    Eliminar {Object.keys(rowSelection).length === 1 ? 'registro' : 'registros'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsImportExportModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium 
                  text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-600 rounded-lg
                  hover:bg-gray-50 dark:hover:bg-gray-700/50
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  transition-colors"
              >
                <Download className="h-5 w-5" />
                Importar/Exportar
              </button>

          <button
            onClick={handleAddNew}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium 
                  text-white bg-emerald-600 rounded-lg
                  hover:bg-emerald-500 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-emerald-500
                  transition-colors"
              >
                <Plus className="h-5 w-5" />
            Agregar Nuevo
          </button>
        </div>
      </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TableFilters />

            <input
              type="text"
              placeholder="Bloque"
              onChange={(e) => handleFilterChange('block', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              type="text"
              placeholder="Entrepaño"
              onChange={(e) => handleFilterChange('shelf', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                focus:outline-none transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <SearchableSelect
              value={table.getState().pagination.pageSize.toString()}
              onChange={(value) => table.setPageSize(Number(value))}
              options={[
                { value: "10", label: "10 / página" },
                { value: "20", label: "20 / página" },
                { value: "30", label: "30 / página" },
                { value: "50", label: "50 / página" },
                { value: "100", label: "100 / página" },
              ]}
              placeholder="Registros por página"
              className="w-[150px]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1}-
              {Math.min(
                table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                table.getFilteredRowModel().rows.length
              )} de {table.getFilteredRowModel().rows.length} registros
            </span>
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = table.getState().pagination.pageIndex + 1;
                return page === 1 || 
                       page === table.getPageCount() || 
                       (page >= currentPage - 2 && page <= currentPage + 2) ||
                       page === currentPage;
              })
              .map((page, i, array) => {
                if (i > 0 && array[i - 1] !== page - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                      <button
                        onClick={() => table.setPageIndex(page - 1)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                          table.getState().pagination.pageIndex + 1 === page
                            ? 'bg-emerald-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(page - 1)}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                      table.getState().pagination.pageIndex + 1 === page
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <FileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        fileToEdit={fileToEdit}
        onSuccess={(message) => {
          setTimeout(() => showToast(message, 'success'), 300);
        }}
        onError={(message) => showToast(message, 'error')}
      />
      
      <ImportExportMenu
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />

      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleBorrowConfirm}
        fileName={selectedFile?.name || ''}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleReturnConfirm}
        fileName={selectedFile?.name || ''}
      />

      <AlertDialog
        isOpen={alert.show}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        onConfirm={alert.onConfirm}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onImport={handleImport}
        onExport={handleExport}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          duration={4000}
        />
      )}
    </div>
  );
}

// Componente para los filtros
export function TableFilters() {
  const setFilter = useFileStore((state) => state.setFilter);

  return (
    <div className="flex gap-2">
      <Select.Root onValueChange={(value) => setFilter('status', value === 'ALL' ? '' : value)}>
        <Select.Trigger className="inline-flex items-center justify-between min-w-[120px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/20">
          <Select.Value placeholder="Estado" />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={4} className="z-[200] min-w-[220px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              <SelectItem value="ALL">Estado</SelectItem>
              <SelectItem value="DISPONIBLE">Disponible</SelectItem>
              <SelectItem value="PRESTADO">Prestado</SelectItem>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default">
              <ChevronDown className="h-4 w-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <Select.Root onValueChange={(value) => setFilter('storageUnit', value === 'ALL' ? '' : value)}>
        <Select.Trigger className="inline-flex items-center justify-between min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/20">
          <Select.Value placeholder="Unidad de Conservación" />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={4} className="z-[200] min-w-[220px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              <SelectItem value="ALL">Unidad de Conservación</SelectItem>
              <SelectItem value="CAJA">Caja</SelectItem>
              <SelectItem value="CARPETA">Carpeta</SelectItem>
              <SelectItem value="TOMO">Tomo</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default">
              <ChevronDown className="h-4 w-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

// Componente SelectItem reutilizable
const SelectItem = React.forwardRef<HTMLDivElement, Select.SelectItemProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        {...props}
        ref={forwardedRef}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Select.ItemIndicator>
            <Check className="h-4 w-4" />
          </Select.ItemIndicator>
        </span>
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    )
  }
)
SelectItem.displayName = 'SelectItem'

// Componente SearchableSelect
const SearchableSelect = React.forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
  }
>(({ value, onChange, options, placeholder = "", className = "" }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = search
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { value: string; label: string }) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer
          hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500 
          dark:focus:ring-emerald-500/20 ${className}`}
      >
        <span>{displayValue}</span>
        <Search className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={ref}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-4 py-1.5 text-sm bg-transparent border border-gray-200 
                  dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                  ${value === option.value ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                  'text-gray-700 dark:text-gray-200'}`}
              >
                {option.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
SearchableSelect.displayName = 'SearchableSelect';