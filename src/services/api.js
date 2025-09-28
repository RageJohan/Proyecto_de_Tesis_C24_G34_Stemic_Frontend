// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
}

// Obtener perfil de usuario
export async function getProfile(token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener el perfil');
  return await res.json();
}

// Actualizar perfil de usuario
export async function updateProfile(data, token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar el perfil');
  return await res.json();
}
