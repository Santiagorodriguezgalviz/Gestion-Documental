import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal } from './AlertModal';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false); // Cerrar el modal primero
      const result = await logout();
      if (result.success) {
        // Pequeño delay para evitar la pantalla en blanco
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener la URL de la foto
  const getPhotoUrl = () => {
    if (user?.photoURL) return user.photoURL;
    const savedPhoto = localStorage.getItem('user_photo');
    if (savedPhoto) return savedPhoto;
    return `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=10B981&color=fff&size=400`;
  };

  return (
    <div className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-[#0B1120] z-30
      border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between h-full px-6">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 
          dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          Control de Archivos
        </h1>

        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 
              rounded-lg transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 
                transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={getPhotoUrl()}
                    alt={user?.displayName || 'Profile'}
                    className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700
                      group-hover:ring-emerald-500 dark:group-hover:ring-emerald-400 transition-all
                      object-cover"
                    onError={(e) => {
                      // Si falla la carga, usar avatar por defecto
                      (e.target as HTMLImageElement).src = 
                        `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=10B981&color=fff&size=400`;
                    }}
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full 
                    ring-2 ring-white dark:ring-[#0B1120]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[150px]">
                    {user?.displayName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'Usuario'}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 
                  dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                ring-1 ring-gray-200 dark:ring-gray-700 py-1 animate-in fade-in slide-in-from-top-5">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        type="logout"
      />
    </div>
  );
}