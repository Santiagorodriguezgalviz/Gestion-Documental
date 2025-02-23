import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div 
      className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#0B1120] shadow-lg
        border-r border-gray-200/50 dark:border-gray-800/50
        transition-transform duration-300 ease-in-out z-40
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
    >
      {/* Logo y título */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 
            dark:from-emerald-500/5 dark:to-teal-500/5 rounded-xl">
            <Logo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 
              dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Gestión
              <br />
              Documental
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sistema de Archivos
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="p-4">
        <h2 className="px-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Menú Principal
        </h2>
        <nav className="mt-4 space-y-1">
          <Link 
            to="/archivos"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400
              hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 group relative
              ring-1 ring-transparent hover:ring-emerald-500/20 dark:hover:ring-emerald-400/10"
          >
            <div className="p-2 rounded-lg bg-emerald-100/10 dark:bg-emerald-900/20 
              group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-400/10 transition-colors">
              <LayoutDashboard 
                size={18} 
                className="text-emerald-600 dark:text-emerald-400 transition-transform duration-300 
                  group-hover:scale-110" 
              />
            </div>
            <span className="font-medium">Control de Archivos</span>
            
            {/* Indicador activo */}
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 
              opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 
          dark:from-emerald-500/[0.02] dark:to-teal-500/[0.02]
          ring-1 ring-emerald-500/20 dark:ring-emerald-400/10">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Sistema de Gestión
            <br />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Developer @Santiago
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export { Sidebar };