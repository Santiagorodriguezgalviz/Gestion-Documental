import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Box, Layers, Grid, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import { FileRecord, StorageUnit } from '../types';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import { fileService } from '../services/fileService';
import * as Select from '@radix-ui/react-select'
import { Check } from 'lucide-react'

registerLocale('es', es);

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileToEdit?: FileRecord;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
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

export function FileModal({ isOpen, onClose, fileToEdit, onSuccess, onError }: FileModalProps) {
  const setFiles = useFileStore((state) => state.setFiles);
  
  // Estado inicial por defecto
  const defaultFormData: Partial<FileRecord> = {
    itemNumber: 0,
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    storageUnit: 'CARPETA' as StorageUnit,
    folioStart: 1,
    folioEnd: 1,
    support: 'PAPEL',
    status: 'DISPONIBLE',
    block: '',
    shelf: ''
  };

  const [formData, setFormData] = useState<Partial<FileRecord>>(fileToEdit || defaultFormData);

  // Resetear el formulario cuando cambie fileToEdit o cuando se cierre el modal
  useEffect(() => {
    setFormData(fileToEdit || defaultFormData);
  }, [fileToEdit, isOpen]);

  const handleClose = () => {
    setFormData(defaultFormData); // Limpiar formulario
    onClose();
  };

  const handleDateChange = (date: Date | null, field: 'startDate' | 'endDate') => {
    setFormData({
      ...formData,
      [field]: date ? date.toISOString().split('T')[0] : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (fileToEdit) {
        await fileService.updateFile(fileToEdit.id, formData as FileRecord);
      } else {
        await fileService.addFile(formData as Omit<FileRecord, 'id'>);
      }
      
      const updatedFiles = await fileService.getFiles();
      setFiles(updatedFiles);
      
      handleClose(); // Usar handleClose en lugar de onClose
      onSuccess(fileToEdit 
        ? 'Registro actualizado correctamente'
        : 'Registro creado correctamente'
      );

    } catch {
      onError(fileToEdit 
        ? 'Error al actualizar el registro'
        : 'Error al crear el registro'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Portal para el modal */}
      <div className="fixed inset-0 z-[60]">
        {/* Overlay con fondo oscuro y animación */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-[0.5px] transition-all duration-300" 
          onClick={handleClose}
          aria-hidden="true"
        />
        
        {/* Contenedor del modal con animación */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/5 animate-in zoom-in-95 duration-300"
              role="dialog"
              aria-modal="true"
            >
              {/* Encabezado del modal */}
              <div className="px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {fileToEdit ? 'Editar Archivo' : 'Nuevo Archivo'}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del formulario */}
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText size={16} />
                        No. ITEM
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={formData.itemNumber}
                          onChange={(e) => setFormData({ ...formData, itemNumber: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all group-hover:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText size={16} />
                        CÓDIGO
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all group-hover:border-emerald-500"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText size={16} />
                        NOMBRE DE LAS SERIES
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all group-hover:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar size={16} />
                        FECHA INICIAL
                      </label>
                      <DatePicker
                        selected={formData.startDate ? new Date(formData.startDate) : null}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        dateFormat="dd 'de' MMMM 'de' yyyy"
                        locale="es"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                        placeholderText="Seleccionar fecha"
                        isClearable
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar size={16} />
                        FECHA FINAL
                      </label>
                      <DatePicker
                        selected={formData.endDate ? new Date(formData.endDate) : null}
                        onChange={(date) => handleDateChange(date, 'endDate')}
                        dateFormat="dd 'de' MMMM 'de' yyyy"
                        locale="es"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                        placeholderText="Seleccionar fecha"
                        isClearable
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Grid size={16} />
                        BLOQUE
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={formData.block}
                          onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all group-hover:border-emerald-500"
                          placeholder="Ej: B1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <LayoutGrid size={16} />
                        ENTREPAÑO
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={formData.shelf}
                          onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all group-hover:border-emerald-500"
                          placeholder="Ej: E3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Box size={16} />
                        UNIDAD DE CONSERVACIÓN
                      </label>
                      <Select.Root
                        value={formData.storageUnit}
                        onValueChange={(value) => setFormData({ ...formData, storageUnit: value as StorageUnit })}
                      >
                        <Select.Trigger className="inline-flex w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500/20 hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-colors">
                          <Select.Value placeholder="Seleccionar unidad" />
                          <Select.Icon>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content position="popper" sideOffset={4} className="z-[200] min-w-[220px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 animate-in fade-in-0 zoom-in-95">
                            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default border-b border-gray-200 dark:border-gray-700">
                              <ChevronUp className="h-4 w-4" />
                            </Select.ScrollUpButton>
                            <Select.Viewport className="p-2">
                              <SelectItem value="CAJA">CAJA</SelectItem>
                              <SelectItem value="CARPETA">CARPETA</SelectItem>
                              <SelectItem value="TOMO">TOMO</SelectItem>
                              <SelectItem value="OTRO">OTRO</SelectItem>
                            </Select.Viewport>
                            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default border-t border-gray-200 dark:border-gray-700">
                              <ChevronDown className="h-4 w-4" />
                            </Select.ScrollDownButton>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Layers size={16} />
                        SOPORTE
                      </label>
                      <input
                        type="text"
                        value={formData.support}
                        onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText size={16} />
                        FOLIO INICIAL
                      </label>
                      <input
                        type="number"
                        value={formData.folioStart}
                        onChange={(e) => setFormData({ ...formData, folioStart: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText size={16} />
                        FOLIO FINAL
                      </label>
                      <input
                        type="number"
                        value={formData.folioEnd}
                        onChange={(e) => setFormData({ ...formData, folioEnd: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pie del modal */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    {fileToEdit ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}