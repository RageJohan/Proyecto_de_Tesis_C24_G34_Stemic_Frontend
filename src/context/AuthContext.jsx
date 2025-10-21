import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJWT } from '../utils/jwt';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const checkTokenExpiration = (token) => {
    if (!token) return false;
    const payload = decodeJWT(token);
    if (!payload) return false;
    
    // Verificar si el token expira en menos de 5 minutos
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    return timeUntilExpiration > 0 && timeUntilExpiration < 300000; // 5 minutos
  };

  const handleSessionExpired = () => {
    logout();
    showNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
    navigate('/login');
  };

  const refreshSession = async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        localStorage.setItem('token', newToken);
        const payload = decodeJWT(newToken);
        setUser(payload ? { ...payload, rol: payload.rol } : null);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Error al refrescar la sesión:', error);
      handleSessionExpired();
    }
    return false;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        const payload = decodeJWT(token);
        if (payload) {
          const expirationTime = payload.exp * 1000;
          if (Date.now() >= expirationTime) {
            // Token expirado, intentar refresh
            const refreshed = await refreshSession();
            if (!refreshed) {
              handleSessionExpired();
            }
          } else {
            setUser({ ...payload, rol: payload.rol });
            setIsAuthenticated(true);
          }
        } else {
          handleSessionExpired();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    // Configurar intervalo para verificar la expiración del token
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token && checkTokenExpiration(token)) {
        await refreshSession();
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [navigate]);

  const login = (token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setIsAuthenticated(true);
    const payload = decodeJWT(token);
    setUser(payload ? { ...payload, rol: payload.rol } : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout,
      refreshSession,
      handleSessionExpired 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
