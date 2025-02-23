import { create } from 'zustand';
import { FileRecord } from '../types';
import { fileService } from '../services/fileService';

interface FileState {
  files: FileRecord[];
  filters: Record<string, string>;
  setFiles: (files: FileRecord[]) => void;
  addFile: (file: Omit<FileRecord, 'id'>) => Promise<void>;
  updateFile: (id: string, file: Partial<FileRecord>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  updateFileStatus: (id: string, status: string, borrowedTo?: string) => Promise<void>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  filteredFiles: () => FileRecord[];
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  filters: {},
  setFiles: (files) => set({ files }),
  addFile: async (file) => {
    const newFile = await fileService.addFile(file);
    set(state => ({ files: [...state.files, newFile] }));
  },
  updateFile: async (id, file) => {
    await fileService.updateFile(id, file);
    const updatedFiles = await fileService.getFiles();
    set({ files: updatedFiles });
  },
  deleteFile: async (id) => {
    await fileService.deleteFile(id);
    set(state => ({
      files: state.files.filter(f => f.id !== id)
    }));
  },
  updateFileStatus: async (id, status, borrowedTo) => {
    await fileService.updateFileStatus(id, status, borrowedTo);
    set(state => ({
      files: state.files.map(f => 
        f.id === id ? { ...f, status, borrowedTo } : f
      )
    }));
  },
  setFilter: (key, value) => 
    set(state => ({
      filters: { ...state.filters, [key]: value }
    })),
  clearFilters: () => set({ filters: {} }),
  filteredFiles: () => {
    const state = get();
    let filtered = [...state.files];
    
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(file => {
          const fileValue = file[key as keyof FileRecord];
          return fileValue?.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    
    return filtered;
  }
}));