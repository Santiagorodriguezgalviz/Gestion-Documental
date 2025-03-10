import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AlertModal } from '../components/AlertModal';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { authService } from '../services/authService';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmailPassword, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/archivos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Crear usuarios iniciales - SOLO EJECUTAR UNA VEZ
    const createUsers = async () => {
      const result = await authService.createInitialUsers();
      if (result.success) {
        console.log('Usuarios creados exitosamente');
      }
    };
    
    createUsers();
  }, []);

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
    } catch {
      setError('Error al iniciar sesión');
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

      <AlertModal
        isOpen={showLoginSuccess}
        onClose={() => setShowLoginSuccess(false)}
        onConfirm={handleLoginSuccess}
        type="login-success"
      />
    </div>
  );
}