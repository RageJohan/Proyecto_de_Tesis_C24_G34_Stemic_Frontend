import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { 
  getStoredToken, 
  setStoredToken, 
  //removeStoredToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage 
} from '../utils/storage';
import type { AuthContextType, User, LoginData, RegisterData } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar autenticación al cargar la app
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        // Verificar que el token siga siendo válido
        try {
          const verifiedUser = await authService.verifyToken();
          setUser(verifiedUser);
          setStoredUser(verifiedUser);
        } catch (error) {
          console.error('Token inválido, limpiando autenticación:', error);
          console.warn('Token inválido, limpiando autenticación');
          clearAuthStorage();
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      clearAuthStorage();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      
      const { user: userData, token: userToken } = response.data;
      
      // Guardar en estado y storage
      setUser(userData);
      setToken(userToken);
      setStoredUser(userData);
      setStoredToken(userToken);
      
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      const { user: userData, token: userToken } = response.data;
      
      // Guardar en estado y storage
      setUser(userData);
      setToken(userToken);
      setStoredUser(userData);
      setStoredToken(userToken);
      
      toast.success(`¡Registro exitoso! Bienvenido, ${userData.nombre}!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al registrarse';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.loginWithGoogle(googleToken);
      
      const { user: userData, token: userToken } = response.data;
      
      // Guardar en estado y storage
      setUser(userData);
      setToken(userToken);
      setStoredUser(userData);
      setStoredToken(userToken);
      
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al autenticar con Google';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Opcional: llamar al endpoint de logout del servidor
      authService.logout().catch(() => {
        // No importa si falla, igual limpiamos local
      });
      
      // Limpiar estado y storage
      setUser(null);
      setToken(null);
      clearAuthStorage();
      
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar limpieza local aunque haya error
      setUser(null);
      setToken(null);
      clearAuthStorage();
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};