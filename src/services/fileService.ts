import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileRecord } from '../types';

const FILES_COLLECTION = 'files';

export const fileService = {
  async getFiles() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, FILES_COLLECTION), orderBy('itemNumber'))
      );
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate instanceof Timestamp ? 
            data.startDate.toDate().toISOString().split('T')[0] : 
            data.startDate,
          endDate: data.endDate instanceof Timestamp ? 
            data.endDate.toDate().toISOString().split('T')[0] : 
            data.endDate,
          borrowedDate: data.borrowedDate instanceof Timestamp ? 
            data.borrowedDate.toDate().toISOString() : 
            data.borrowedDate,
          returnDate: data.returnDate instanceof Timestamp ? 
            data.returnDate.toDate().toISOString() : 
            data.returnDate,
        } as FileRecord;
      });
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      throw error;
    }
  },

  async addFile(file: Omit<FileRecord, 'id'>) {
    try {
      const fileData = {
        ...file,
        startDate: file.startDate ? Timestamp.fromDate(new Date(file.startDate)) : null,
        endDate: file.endDate ? Timestamp.fromDate(new Date(file.endDate)) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: file.status || 'DISPONIBLE',
        borrowedTo: null,
        borrowedDate: null,
        returnDate: null,
      };
      const docRef = await addDoc(collection(db, FILES_COLLECTION), fileData);
      return { id: docRef.id, ...file };
    } catch (error) {
      console.error('Error al agregar archivo:', error);
      throw error;
    }
  },

  async updateFile(id: string, file: Partial<FileRecord>) {
    try {
      const updateData = {
        ...file,
        updatedAt: serverTimestamp(),
      };
      if (file.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(file.startDate));
      }
      if (file.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(file.endDate));
      }
      await updateDoc(doc(db, FILES_COLLECTION, id), updateData);
      return { id, ...file };
    } catch (error) {
      console.error('Error al actualizar archivo:', error);
      throw error;
    }
  },

  async updateFileStatus(id: string, status: string, borrowedTo?: string) {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'PRESTADO') {
        updateData.borrowedTo = borrowedTo || null;
        updateData.borrowedDate = serverTimestamp();
        updateData.returnDate = null;
      } else {
        updateData.borrowedTo = null;
        updateData.borrowedDate = null;
        updateData.returnDate = serverTimestamp();
      }

      await updateDoc(doc(db, FILES_COLLECTION, id), updateData);
      
      const updatedDoc = await getDocs(query(collection(db, FILES_COLLECTION)));
      return updatedDoc.docs
        .find(doc => doc.id === id)
        ?.data() as FileRecord;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  },

  async deleteFile(id: string) {
    try {
      await deleteDoc(doc(db, FILES_COLLECTION, id));
      return id;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }
}; 