import { useAuth } from '../hooks/useAuth';
import { User } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();

  // Función para obtener el título del rol
  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'viewer':
        return 'Supervisor';
      default:
        return 'Usuario';
    }
  };

  // Función para obtener el color del rol
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      case 'viewer':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
        {user?.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'Usuario'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </div>

      {/* Info del usuario */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {user?.displayName || user?.email?.split('@')[0]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getRoleColor(user?.role)}`}>
          {getRoleTitle(user?.role)}
        </span>
      </div>
    </div>
  );
} 