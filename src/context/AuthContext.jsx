import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJWT } from '../utils/jwt';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWT(token);
      return payload ? { ...payload, rol: payload.rol } : null;
    }
    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      const payload = decodeJWT(token);
      setUser(payload ? { ...payload, rol: payload.rol } : null);
    } else {
      setUser(null);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const payload = decodeJWT(token);
    setUser(payload ? { ...payload, rol: payload.rol } : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
