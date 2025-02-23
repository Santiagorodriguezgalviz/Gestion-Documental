function FileManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Control de Archivos
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gestione los documentos y archivos del sistema
        </p>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-sm 
        border border-gray-200 dark:border-gray-800/50">
        <DataTable />
      </div>
    </div>
  );
} 