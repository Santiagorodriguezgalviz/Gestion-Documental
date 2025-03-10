import { useEffect, useCallback } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Establecer persistencia local
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userRole = userDoc.data()?.role || 'viewer';

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          role: userRole // Asignar el rol desde Firestore
        });
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_photo');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // Obtener la foto en mejor calidad
      const photoURL = result.user.photoURL?.replace('s96-c', 's400-c') || null;
      
      const token = await result.user.getIdToken();
      localStorage.setItem('auth_token', token);
      if (photoURL) localStorage.setItem('user_photo', photoURL);

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: photoURL,
        role: 'Administrador'
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging in with Google:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_photo');
      setUser(null);
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error };
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const result = await authService.loginUser(email, password);
      if (result.success) {
        setUser({
          uid: auth.currentUser?.uid || '',
          email: email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: result.role // Usar el rol devuelto por el servicio
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error logging in with email/password:', error);
      return { success: false, error };
    }
  };

  const canEdit = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  return {
    user,
    loginWithGoogle,
    loginWithEmailPassword,
    logout,
    isAuthenticated: !!user || !!localStorage.getItem('auth_token'),
    canEdit,
  };
} 