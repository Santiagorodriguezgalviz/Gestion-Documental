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
  retentionStatus: 'RETENIDO' | 'NO_RETENIDO';
  borrowedDate?: string;
  borrowedTo?: string;
  block?: string;
  shelf?: string;
  retentionReason?: string;
}

export type FileStatus = 'DISPONIBLE' | 'PRESTADO' | 'RETENIDO';
export type StorageUnit = 'CAJA' | 'CARPETA' | 'TOMO' | 'OTRO';