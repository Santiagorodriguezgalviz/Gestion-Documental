import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Files } from 'lucide-react';

export function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <Navbar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center gap-3 mb-6">
              <Files className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Control de Archivos
              </h1>
            </div>
            
            <div className="bg-white dark:bg-gray-900 shadow rounded-lg">
              <div className="p-6">
                <DataTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}