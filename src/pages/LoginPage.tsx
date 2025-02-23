import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AlertModal } from '../components/AlertModal';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmailPassword, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/archivos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await loginWithEmailPassword(email, password);
      if (result.success) {
        setShowLoginSuccess(true);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        setShowLoginSuccess(true);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error al iniciar sesión con Google');
    }
  };

  const handleLoginSuccess = () => {
    const from = location.state?.from?.pathname || '/archivos';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 px-8 py-10 rounded-2xl shadow-2xl 
          ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="p-6 rounded-2xl transform transition-all duration-300 hover:scale-105
                bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10
                ring-1 ring-emerald-500/20 dark:ring-emerald-400/10">
                <Logo className="w-16 h-16" variant="login" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Gestión Documental
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="group relative w-full flex items-center justify-center gap-3 px-4 py-3 
                bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                hover:border-emerald-500 dark:hover:border-emerald-500
                transition-all duration-300 hover:shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Continuar con Google
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  O ingrese con email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl animate-shake">
                  <AlertCircle size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 
                        rounded-xl focus:ring-emerald-500 focus:border-emerald-500 
                        dark:bg-gray-800 dark:text-white transition-all 
                        group-hover:border-emerald-500"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
                      text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 
                        rounded-xl focus:ring-emerald-500 focus:border-emerald-500 
                        dark:bg-gray-800 dark:text-white transition-all 
                        group-hover:border-emerald-500"
                      placeholder="••••••••"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
                      text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1
                        text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-emerald-500" />
                      ) : (
                        <Eye size={18} />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                  rounded-xl shadow-sm text-sm font-medium text-white 
                  bg-emerald-600 hover:bg-emerald-500 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 
                  transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showLoginSuccess}
        onClose={() => setShowLoginSuccess(false)}
        onConfirm={handleLoginSuccess}
        type="login-success"
      />
    </div>
  );
}