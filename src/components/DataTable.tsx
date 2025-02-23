import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { FileText, FolderOpen, Pencil, Trash2, Plus, Calendar, Download, FileSpreadsheet, Grid, LayoutGrid, Search, RefreshCw } from 'lucide-react';
import { FileModal } from './FileModal';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { ExportMenu } from './ExportMenu';
import { ImportExportMenu } from './ImportExportMenu';
import { BorrowModal } from './BorrowModal';
import { ReturnModal } from './ReturnModal';
import { fileService } from '../services/fileService';

const columnHelper = createColumnHelper<FileRecord>();

export function DataTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<FileRecord | undefined>();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [exportYear, setExportYear] = useState<string>('');
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  
  const files = useFileStore((state) => state.files);
  const filters = useFileStore((state) => state.filters);
  const setFilter = useFileStore((state) => state.setFilter);
  const clearFilters = useFileStore((state) => state.clearFilters);
  const deleteFile = useFileStore((state) => state.deleteFile);
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
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
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
      cell: (info) => (
        <div className="flex gap-2">
          {info.row.original.status === 'DISPONIBLE' ? (
            <button
              onClick={() => handleBorrow(info.row.original)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="Prestar"
            >
              <FolderOpen size={18} />
            </button>
          ) : (
            <button
              onClick={() => handleReturn(info.row.original)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
              title="Devolver"
            >
              <FileText size={18} />
            </button>
          )}
          <button
            onClick={() => handleEdit(info.row.original)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
            title="Editar"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
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
      } catch (error) {
        console.error('Error al cargar archivos:', error);
        alert('Error al cargar los archivos. Por favor, recargue la página.');
      }
    };

    loadFiles();
  }, [setFiles]);

  const handleBorrow = (file: FileRecord) => {
    setSelectedFile(file);
    setBorrowModalOpen(true);
  };

  const handleReturn = (file: FileRecord) => {
    setSelectedFile(file);
    setReturnModalOpen(true);
  };

  const handleEdit = (file: FileRecord) => {
    setFileToEdit(file);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este archivo?')) {
      try {
        await fileService.deleteFile(id);
        const updatedFiles = await fileService.getFiles();
        setFiles(updatedFiles);
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        alert('Error al eliminar el archivo. Por favor, intente nuevamente.');
      }
    }
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
      }
    } catch (error) {
      console.error('Error al prestar archivo:', error);
      alert('Error al prestar el archivo. Por favor, intente nuevamente.');
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
      }
    } catch (error) {
      console.error('Error al devolver archivo:', error);
      alert('Error al devolver el archivo. Por favor, intente nuevamente.');
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

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

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
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsImportExportOpen(true)}
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
            <select
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Estado</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="PRESTADO">Prestado</option>
            </select>

            <select
              onChange={(e) => handleFilterChange('storageUnit', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Unidad de Conservación</option>
              <option value="CAJA">Caja</option>
              <option value="CARPETA">Carpeta</option>
              <option value="TOMO">Tomo</option>
            </select>

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
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {'<<'}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {'<'}
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {'>'}
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {'>>'}
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modales */}
      <FileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fileToEdit={fileToEdit} 
      />
      
      <ImportExportMenu
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />

      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleBorrowConfirm}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleReturnConfirm}
      />
    </div>
  );
}