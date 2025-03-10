import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { hashPassword } from '../utils/crypto';

const USERS = {
  ADMIN: {
    email: 'lidergestiondocumental@gmail.com',
    password: 'Diego2025',
    role: 'admin'
  },
  VIEWER: {
    email: 'coordinadoraacademica@gmail.com',
    password: 'Erika2025',
    role: 'viewer'
  }
};

export const authService = {
  async registerUser(email: string, password: string, role: UserRole = 'user') {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user) {
      // Crear workspace para el nuevo usuario
      const workspaceId = crypto.randomUUID();

      // Guardar perfil del usuario
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        role,
        workspaceId,
        createdAt: new Date()
      });
    }
  },

  async loginUser(email: string, password: string) {
    try {
      // Verificar primero si es un usuario autorizado y obtener su rol
      const userType = Object.values(USERS).find(user => user.email === email);
      if (!userType) {
        throw new Error('Usuario no autorizado');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Asignar o actualizar el rol en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: userType.role,  // Asignar el rol correspondiente
        createdAt: new Date()
      }, { merge: true });

      return { 
        success: true, 
        role: userType.role 
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Credenciales inválidas' };
    }
  },

  async createInitialUsers() {
    try {
      // Primero crear el usuario admin
      try {
        const adminCred = await createUserWithEmailAndPassword(
          auth, 
          USERS.ADMIN.email, 
          USERS.ADMIN.password
        );

        // Crear el documento del admin primero
        await setDoc(doc(db, 'users', adminCred.user.uid), {
          email: USERS.ADMIN.email,
          role: USERS.ADMIN.role,
          createdAt: new Date()
        });

        // Luego crear el usuario viewer
        const viewerCred = await createUserWithEmailAndPassword(
          auth, 
          USERS.VIEWER.email, 
          USERS.VIEWER.password
        );

        await setDoc(doc(db, 'users', viewerCred.user.uid), {
          email: USERS.VIEWER.email,
          role: USERS.VIEWER.role,
          createdAt: new Date()
        });

      } catch (error: any) {
        // Ignorar error si los usuarios ya existen
        if (error.code !== 'auth/email-already-in-use') throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating users:', error);
      return { success: false };
    }
  }
}; 