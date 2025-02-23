export interface FileRecord {
  id: string;
  itemNumber: number;
  code?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  storageUnit: 'CAJA' | 'CARPETA' | 'TOMO' | 'OTRO';
  folioStart: number;
  folioEnd: number;
  support: string;
  status: 'DISPONIBLE' | 'PRESTADO';
  borrowedDate?: string;
  borrowedTo?: string;
  block?: string;
  shelf?: string;
}

export type FileStatus = 'DISPONIBLE' | 'PRESTADO';
export type StorageUnit = 'CAJA' | 'CARPETA' | 'TOMO' | 'OTRO';