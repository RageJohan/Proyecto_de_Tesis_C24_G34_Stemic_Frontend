// Tipos para la autenticación
export interface User {
  id: string;
  nombre: string;
  correo: string;
  avatar_url?: string;
  rol: 'usuario' | 'organizador' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    tokenType: string;
  };
}

export interface RegisterData {
  nombre: string;
  correo: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  correo: string;
  password: string;
}

export interface GoogleAuthData {
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Tipos para errores de API
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Tipos para formularios
export interface FormFieldError {
  message: string;
}

export interface ValidationErrors {
  [key: string]: FormFieldError;
}

// Tipos para la respuesta del perfil
export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Tipos para configuración
export interface AppConfig {
  API_URL: string;
  GOOGLE_CLIENT_ID: string;
}