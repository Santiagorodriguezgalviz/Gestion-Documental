import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FileManagementPage } from '../pages/FileManagementPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/archivos" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: <ProtectedRoute><Layout /></ProtectedRoute>,
      children: [
        {
          path: '/archivos',
          element: <FileManagementPage />,
        },
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);