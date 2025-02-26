import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Box, Layers, Grid, Folder, Book, Info, Lock } from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import { FileRecord, StorageUnit } from '../types';
import { CustomDatePicker } from './DatePicker';
import { fileService } from '../services/fileService';
import * as Select from '@radix-ui/react-select'
import { Check } from 'lucide-react'

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileToEdit?: FileRecord;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface StorageNumbers {
  caja?: string;
  carpeta?: string;
  tomo?: string;
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
      shelf: '',
      retentionReason: '',
  };

  const [formData, setFormData] = useState<Partial<FileRecord>>(fileToEdit || defaultFormData);
  const [storageNumbers, setStorageNumbers] = useState<StorageNumbers>({
    caja: '',
    carpeta: '',
    tomo: ''
  });

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
      // Crear el objeto con los datos del formulario
      const fileData = {
        ...formData,
        boxNumber: storageNumbers.caja || undefined,
        folderNumber: storageNumbers.carpeta || undefined,
        volumeNumber: storageNumbers.tomo || undefined
      };

      if (fileToEdit) {
        await fileService.updateFile(fileToEdit.id, fileData as FileRecord);
      } else {
        await fileService.addFile(fileData as Omit<FileRecord, 'id'>);
      }
      
      const updatedFiles = await fileService.getFiles();
      setFiles(updatedFiles);
      
      handleClose();
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
                <div className="px-8 py-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Sección de información básica */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FileText size={16} />
                        Información Básica
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            No. ITEM
                          </label>
                          <div className="relative group">
                            <input
                              type="number"
                              value={formData.itemNumber}
                              onChange={(e) => setFormData({ ...formData, itemNumber: parseInt(e.target.value) })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 
                                transition-all group-hover:border-emerald-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            CÓDIGO
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={formData.code}
                              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 
                                transition-all group-hover:border-emerald-500"
                              placeholder="Opcional"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          NOMBRE DE LAS SERIES
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                              shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                              dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 
                              transition-all group-hover:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección de fechas */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar size={16} />
                        Fechas
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            FECHA INICIAL
                          </label>
                          <CustomDatePicker
                            value={formData.startDate ? new Date(formData.startDate) : null}
                            onChange={(date) => handleDateChange(date, 'startDate')}
                            placeholder="Seleccionar fecha inicial"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            FECHA FINAL
                          </label>
                          <CustomDatePicker
                            value={formData.endDate ? new Date(formData.endDate) : null}
                            onChange={(date) => handleDateChange(date, 'endDate')}
                            placeholder="Seleccionar fecha final"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección de ubicación */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Grid size={16} />
                        Ubicación
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            BLOQUE
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={formData.block}
                              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 
                                transition-all group-hover:border-emerald-500"
                              placeholder="Ej: B1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            ENTREPAÑO
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={formData.shelf}
                              onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 
                                transition-all group-hover:border-emerald-500"
                              placeholder="Ej: E3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de unidad de conservación */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Box size={16} />
                        Unidad de Conservación
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div className="relative group">
                          <label className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                            Caja
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={storageNumbers.caja}
                              onChange={(e) => setStorageNumbers(prev => ({
                                ...prev,
                                caja: e.target.value
                              }))}
                              placeholder="Ej: 1"
                              min="0"
                              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-white dark:bg-gray-800 
                                group-hover:border-emerald-500 dark:group-hover:border-emerald-500/50
                                focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20
                                placeholder-gray-400 dark:placeholder-gray-500
                                transition-all duration-200"
                            />
                            <Box className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                            Carpeta
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={storageNumbers.carpeta}
                              onChange={(e) => setStorageNumbers(prev => ({
                                ...prev,
                                carpeta: e.target.value
                              }))}
                              placeholder="Ej: 5"
                              min="0"
                              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-white dark:bg-gray-800 
                                group-hover:border-emerald-500 dark:group-hover:border-emerald-500/50
                                focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20
                                placeholder-gray-400 dark:placeholder-gray-500
                                transition-all duration-200"
                            />
                            <Folder className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                            Tomo (Opcional)
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={storageNumbers.tomo}
                              onChange={(e) => setStorageNumbers(prev => ({
                                ...prev,
                                tomo: e.target.value
                              }))}
                              placeholder="Ej: 3"
                              min="0"
                              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-white dark:bg-gray-800 
                                group-hover:border-emerald-500 dark:group-hover:border-emerald-500/50
                                focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20
                                placeholder-gray-400 dark:placeholder-gray-500
                                transition-all duration-200"
                            />
                            <Book className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-2">
                        <Info className="h-4 w-4" />
                        Ingresa los números correspondientes a cada unidad de conservación
                      </p>
                    </div>

                    {/* Sección de detalles adicionales */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Layers size={16} />
                        Detalles Adicionales
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            SOPORTE
                          </label>
                          <input
                            type="text"
                            value={formData.support}
                            onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                              shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                              dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            FOLIO INICIAL
                          </label>
                          <input
                            type="number"
                            value={formData.folioStart}
                            onChange={(e) => setFormData({ ...formData, folioStart: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                              shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                              dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            FOLIO FINAL
                          </label>
                          <input
                            type="number"
                            value={formData.folioEnd}
                            onChange={(e) => setFormData({ ...formData, folioEnd: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                              shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                              dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección de estado de retención */}
                    <div className="col-span-2 space-y-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Lock size={16} />
                        Estado de Retención
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.status === 'RETENIDO'}
                            onChange={(e) => setFormData({
                              ...formData,
                              status: e.target.checked ? 'RETENIDO' : 'DISPONIBLE',
                              retentionReason: e.target.checked ? formData.retentionReason : ''
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                            peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer 
                            dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                            after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                            after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600
                            hover:bg-gray-300 dark:hover:bg-gray-600 peer-checked:hover:bg-emerald-500"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {formData.status === 'RETENIDO' ? 'Archivo Retenido' : 'Archivo Disponible'}
                          </span>
                        </label>

                        {formData.status === 'RETENIDO' && (
                          <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Motivo de Retención
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.retentionReason || ''}
                                onChange={(e) => setFormData({ ...formData, retentionReason: e.target.value })}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 
                                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                  focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                                  transition-all"
                                placeholder="Describa el motivo de la retención..."
                                rows={3}
                                required={formData.status === 'RETENIDO'}
                              />
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                              <Info className="h-4 w-4" />
                              Este archivo no podrá ser prestado mientras esté retenido
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pie del modal */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 
                      hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 
                      hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-all duration-200 
                      focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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