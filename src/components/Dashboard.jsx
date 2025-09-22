import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ color: '#333', margin: 0 }}>STEMIC Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>
      </header>
      
      <main>
        <div style={{
          background: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>
            ¡Bienvenido al Sistema STEMIC!
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Has iniciado sesión correctamente. El sistema está funcionando con React Router.
          </p>
        </div>
      </main>
    </div>
  );
}
