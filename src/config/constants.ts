// Configuración de la aplicación
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      GOOGLE: '/api/auth/google',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify',
    },
  },
  TIMEOUT: 10000, // 10 segundos
} as const;

// Configuración de Google OAuth
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
} as const;

// Configuración de cookies/localStorage
export const STORAGE_KEYS = {
  TOKEN: 'stemic_auth_token',
  USER: 'stemic_user',
  REMEMBER_ME: 'stemic_remember_me',
} as const;

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EVENTS: '/events',
} as const;

// Configuración de validaciones
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-.]{2,100}$/,
  },
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para acceder.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Por favor, corrige los errores del formulario.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  USER_EXISTS: 'El correo ya está registrado.',
} as const;

// Roles de usuario
export const USER_ROLES = {
  USUARIO: 'usuario',
  ORGANIZADOR: 'organizador',
  ADMIN: 'admin',
} as const;