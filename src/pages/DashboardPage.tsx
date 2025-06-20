import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Calendar, BarChart } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              S
            </div>
            <h1 className="logo-text">
              STEMIC
            </h1>
          </div>
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.nombre}
                  />
                ) : (
                  <User size={16} style={{ color: 'var(--gray-600)' }} />
                )}
              </div>
              <span className="user-name">
                {user?.nombre}
              </span>
              <span className="user-role">
                {user?.rol}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }}>
        {/* Welcome Section */}
        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: 'var(--spacing-2)' }}>
              ¡Bienvenido, {user?.nombre}! 👋
            </h2>
            <p className="text-gray-600">
              Aquí puedes ver tu actividad en la plataforma STEMIC
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: 'var(--spacing-8)' }}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-label">
                Eventos Participados
              </p>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <BarChart size={24} />
            </div>
            <div>
              <p className="stat-label">
                Horas de Formación
              </p>
              <p className="stat-value">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <User size={24} />
            </div>
            <div>
              <p className="stat-label">
                Certificaciones
              </p>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Información del Usuario
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.nombre}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Correo</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.correo}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900" style={{ textTransform: 'capitalize' }}>
                  {user?.rol}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Miembro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div 
          className="card" 
          style={{ 
            marginTop: 'var(--spacing-8)',
            background: 'linear-gradient(135deg, var(--stem-500) 0%, var(--primary-600) 100%)',
            color: 'white'
          }}
        >
          <div className="card-body">
            <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>
              🚀 Próximamente
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Estamos trabajando en nuevas funcionalidades como gestión de eventos, 
              métricas de impacto, y mucho más. ¡Mantente atento!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;