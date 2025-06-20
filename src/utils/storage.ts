import { STORAGE_KEYS } from '../config/constants';
import type { User } from '../types';

// Token management
export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

export const removeStoredToken = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// User management
export const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

export const removeStoredUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Clear all auth data
export const clearAuthStorage = (): void => {
  removeStoredToken();
  removeStoredUser();
  try {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

// Remember me functionality
export const getRememberMe = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};

export const setRememberMe = (remember: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  } catch (error) {
    console.error('Error setting remember me:', error);
  }
};