import { apiService } from './api';
import { API_CONFIG } from '../config/constants';
import type { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  ProfileResponse,
  User 
} from '../types';

class AuthService {
  // Registro manual
  async register(data: RegisterData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
  }

  // Login manual
  async login(data: LoginData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data
    );
  }

  // Autenticación con Google
  async loginWithGoogle(token: string): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.GOOGLE,
      { token }
    );
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    const response = await apiService.get<ProfileResponse>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
    return response.data.user;
  }

  // Verificar token
  async verifyToken(): Promise<User> {
    const response = await apiService.get<ProfileResponse>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY
    );
    return response.data.user;
  }

  // Logout (opcional, para invalidar token en el servidor)
  async logout(): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // No importa si falla, igual limpiamos el token local
      console.warn('Error al hacer logout en el servidor:', error);
    }
  }
}

export const authService = new AuthService();