import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/constants';
// Importa los estilos globales de componentes
import '@/styles/components.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'usuario' | 'organizador' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex-center bg-gray-50">
        <div className="text-center">
          <div className="spinner" style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '3px',
            color: 'var(--stem-600)',
            margin: '0 auto var(--spacing-4)'
          }}></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.rol !== requiredRole) {
    return (
      <div className="min-h-screen flex-center bg-gray-50">
        <div className="text-center">
          <div
            className="card"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: 'var(--spacing-6)',
              maxWidth: '28rem'
            }}
          >
            <h2
              className="text-xl font-semibold"
              style={{
                color: '#991b1b',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Acceso Denegado
            </h2>
            <p style={{ color: '#dc2626', marginBottom: 'var(--spacing-4)' }}>
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--red-600)' }}
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;