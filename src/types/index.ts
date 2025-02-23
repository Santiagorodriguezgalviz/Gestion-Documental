export interface FileRecord {
  id: string;
  itemNumber: number;
  code?: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  storageUnit: 'CAJA' | 'CARPETA' | 'TOMO' | 'OTRO';
  folioStart: number;
  folioEnd: number;
  support: string;
  status: 'DISPONIBLE' | 'PRESTADO';
  borrowedTo?: string | null;
  borrowedDate?: string | null;
  returnDate?: string | null;
  block?: string;
  shelf?: string;
  createdAt?: any;
  updatedAt?: any;
} 