import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente a la página de archivos
    navigate('/archivos');
  }, [navigate]);

  return null;
}

export { DashboardPage }; 