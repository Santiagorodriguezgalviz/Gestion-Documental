import { useEffect } from 'react';
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

export function useAuth() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Establecer persistencia local
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Asegurarse de obtener la foto más reciente
        const photoURL = firebaseUser.photoURL?.replace('s96-c', 's400-c') || null;
        
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('auth_token', token);
        // Guardar la foto en localStorage para acceso rápido
        if (photoURL) localStorage.setItem('user_photo', photoURL);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: photoURL,
          role: 'Administrador'
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
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error };
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      localStorage.setItem('auth_token', token);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || null,
        photoURL: result.user.photoURL || null,
        role: 'Administrador'
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging in with email/password:', error);
      return { success: false, error };
    }
  };

  return {
    user,
    loginWithGoogle,
    loginWithEmailPassword,
    logout,
    isAuthenticated: !!user || !!localStorage.getItem('auth_token')
  };
} 