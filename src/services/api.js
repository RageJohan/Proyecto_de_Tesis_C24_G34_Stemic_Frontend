// Obtener mi postulación
export async function getMyPostulation() {
  const res = await fetchWithAuth(`${API_URL}/api/postulations/my-postulation`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo obtener tu postulación');
  const json = await res.json();
  return json.data || null;
}

// Crear postulación
export async function createPostulation(data) {
  const res = await fetchWithAuth(`${API_URL}/api/postulations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('No se pudo crear la postulación');
  const json = await res.json();
  return json.data || null;
}

// Eliminar mi postulación
export async function deleteMyPostulation(id) {
  const res = await fetchWithAuth(`${API_URL}/api/postulations/my-postulation/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo eliminar la postulación');
  const json = await res.json();
  return json.data || null;
}
// Obtener inscripciones del usuario
export async function getMyInscriptions() {
  const res = await fetchWithAuth(`${API_URL}/api/my-inscriptions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudieron cargar tus inscripciones');
  const json = await res.json();
  return json.data || [];
}
// Cancelar inscripción a un evento
export async function cancelarInscripcionEvento(eventId) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${eventId}/inscription`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo cancelar la inscripción');
  return await res.json();
}
// Verificar estado de inscripción
export async function estadoInscripcionEvento(eventId) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${eventId}/inscription/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo verificar el estado de inscripción');
  const json = await res.json();
  return json.data?.is_inscribed || false;
}
// Inscribirse a un evento (sin postulación)
export async function inscribirseEvento(eventId) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${eventId}/inscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo inscribir al evento');
  return await res.json();
}
// src/services/api.js

// Obtener opciones de perfil (géneros, intereses, etc)
export async function getProfileOptions() {
  const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/auth/profile/options`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Error al obtener opciones de perfil');
  const json = await res.json();
  return json.data;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetchWithAuth(url, options);
  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
  return res.json();
}

// Obtener perfil de usuario
export async function getProfile(token) {
  const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Error al obtener el perfil');
  return await res.json();
}

// Actualizar perfil de usuario
export async function updateProfile(data, token) {
  let body;
  let headers = {};
  if (data.avatar && data.avatar instanceof File) {
    // Si hay imagen, usar FormData
    body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        body.append('avatar', value);
      } else if (Array.isArray(value)) {
        value.forEach(v => body.append(key, v));
      } else {
        body.append(key, value);
      }
    });
    // No poner Content-Type, fetch lo gestiona
  } else {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers,
    body,
  });
  if (!res.ok) throw new Error('Error al actualizar el perfil');
  return await res.json();
}

// Refrescar el token de acceso usando el refresh token
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No hay refresh token');
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('No se pudo refrescar el token');
  const json = await res.json();
  if (json.token) {
    localStorage.setItem('token', json.token);
    return json.token;
  }
  throw new Error('No se recibió nuevo token');
}

// Wrapper para peticiones protegidas con manejo de refresh
export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem('token');
  if (!options.headers) options.headers = {};
  options.headers['Authorization'] = `Bearer ${token}`;
  let res = await fetch(url, options);
  if (res.status === 401) {
    // Intentar refrescar el token
    try {
      token = await refreshAccessToken();
      options.headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(url, options);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new Error('Sesión expirada. Por favor inicia sesión.');
    }
  }
  return res;
}
