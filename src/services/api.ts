import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/constants';
import { getStoredToken, removeStoredToken } from '../utils/storage';
import toast from 'react-hot-toast';

// Crear instancia de axios
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para requests - agregar token automáticamente
  instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses - manejar errores globales
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      // Token expirado o inválido
      if (error.response?.status === 401) {
        removeStoredToken();
        window.location.href = '/login';
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Error de servidor
      if (error.response?.status >= 500) {
        toast.error('Error del servidor. Intenta más tarde.');
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiInstance();

// Clase para manejar las peticiones API
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejar errores de manera consistente
  private handleError(error: unknown): Error {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object'
    ) {
      const response = (error as { response: { data?: { message?: string }, status?: number } }).response;
      const message = response.data?.message || 'Error en la petición';
      const apiError = new Error(message);
      (apiError as { status?: number }).status = response.status;
      (apiError as { data?: unknown }).data = response.data;
      return apiError;
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'request' in error
    ) {
      return new Error('Error de conexión. Verifica tu internet.');
    } else {
      return new Error('Error inesperado');
    }
  }
}

export const apiService = new ApiService();