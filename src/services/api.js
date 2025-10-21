// Obtener evento por ID
export async function getEventById(id) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Could not fetch event');
  const json = await res.json();
  return json.data || json;
}

// Actualizar evento
export async function updateEvent(id, formData) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${id}`, {
    method: 'PUT',
    body: formData,
    // No poner Content-Type, fetch lo gestiona con FormData
  });
  if (!res.ok) {
    let msg = 'Could not update event';
    try {
      const err = await res.json();
      if (err && err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }
  return await res.json();
}
// Crear evento (admin)
export async function createEvent(formData) {
  const res = await fetchWithAuth(`${API_URL}/api/events`, {
    method: 'POST',
    body: formData,
    // No poner Content-Type, fetch lo gestiona con FormData
  });
  if (!res.ok) {
    let msg = 'No se pudo crear el evento';
    try {
      const err = await res.json();
      if (err && err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }
  return await res.json();
}
// Crear alianza (admin)
export async function createAlliance(formData) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('No se pudo crear la alianza');
  const json = await res.json();
  return json.data || null;
}

// Actualizar alianza (admin)
export async function updateAlliance(id, formData) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/${id}`, {
    method: 'PATCH',
    body: formData,
  });
  if (!res.ok) {
    let errorMessage = 'No se pudo actualizar la alianza';
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }
  const json = await res.json();
  return json.data || null;
}

// Obtener alianza por ID (admin)
export async function getAllianceById(id) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo obtener la alianza');
  const json = await res.json();
  return json.data || null;
}
// Obtener todas las alianzas (admin)
export async function getAdminAlliances({ activo = '', nombre = '', descripcion = '', page = 1, limit = 10 }) {
  const params = [];
  if (activo) params.push(`activo=${encodeURIComponent(activo)}`);
  if (nombre) params.push(`nombre=${encodeURIComponent(nombre)}`);
  if (descripcion) params.push(`descripcion=${encodeURIComponent(descripcion)}`);
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/admin${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener las alianzas');
  const json = await res.json();
  return json;
}

// Activar alianza
export async function activateAlliance(id) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/${id}/activar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo activar la alianza');
  return await res.json();
}

// Desactivar alianza
export async function deactivateAlliance(id) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/${id}/desactivar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo desactivar la alianza');
  return await res.json();
}

// Eliminar alianza permanentemente
export async function deleteAlliance(id) {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo eliminar la alianza');
  return await res.json();
}
// Obtener todas las postulaciones (admin)
export async function getAdminPostulations({ estado = '', carrera = '', page = 1, limit = 10 }) {
  const params = [];
  if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
  if (carrera) params.push(`carrera_especialidad=${encodeURIComponent(carrera)}`);
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const res = await fetchWithAuth(`${API_URL}/api/postulations${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener las postulaciones');
  const json = await res.json();
  return json;
}

// Aprobar postulación
export async function approvePostulation(id) {
  const res = await fetchWithAuth(`${API_URL}/api/postulations/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo aprobar la postulación');
  return await res.json();
}

// Rechazar postulación
export async function rejectPostulation(id) {
  const res = await fetchWithAuth(`${API_URL}/api/postulations/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo rechazar la postulación');
  return await res.json();
}
// Obtener todos los eventos
export async function getEvents() {
  const res = await fetchWithAuth(`${API_URL}/api/events`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error('No se pudieron obtener los eventos');
  const json = await res.json();
  if (Array.isArray(json)) return json;
  return json.data || [];
}
// Obtener todas las alianzas
export async function getAlliances() {
  const res = await fetchWithAuth(`${API_URL}/api/alianzas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudieron obtener las alianzas');
  const json = await res.json();
  return json.data || [];
}
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

export async function apiFetch(endpoint, options = {}, requiresAuth = false) {
  const url = `${API_URL}${endpoint}`;
  let res;
  
  if (requiresAuth) {
    res = await fetchWithAuth(url, options);
  } else {
    res = await fetch(url, options);
  }
  
  if (!res.ok) {
    let errorMessage = `Error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Si no podemos parsear el error, usamos el mensaje por defecto
    }
    throw new Error(errorMessage);
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
  
  // Si no hay token, rechazar inmediatamente
  if (!token) {
    throw new Error('No hay token de acceso');
  }

  options.headers['Authorization'] = `Bearer ${token}`;
  
  try {
    let res = await fetch(url, options);
    
    // Si la respuesta es 401 o 403, intentar refresh
    if (res.status === 401 || res.status === 403) {
      try {
        token = await refreshAccessToken();
        if (!token) {
          throw new Error('No se pudo obtener un nuevo token');
        }
        
        options.headers['Authorization'] = `Bearer ${token}`;
        res = await fetch(url, options);
        
        // Si aún después del refresh sigue dando error de autenticación
        if (res.status === 401 || res.status === 403) {
          throw new Error('Sesión expirada');
        }
      } catch (error) {
        // Limpiar tokens y notificar error de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Propagar el error con información adicional
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
    }
    
    // Si la respuesta no es ok después de todos los intentos
    if (!res.ok) {
      let errorMessage = 'Error en la petición';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear el error, usar mensaje genérico
      }
      throw new Error(errorMessage);
    }
    
    return res;
  } catch (error) {
    // Si es un error de red o CORS
    if (error.name === 'TypeError') {
      throw new Error('Error de conexión. Por favor verifica tu conexión a internet.');
    }
    throw error;
  }
}

// Obtener opciones para eventos
export async function getEventOptions() {
  const res = await fetchWithAuth(`${API_URL}/api/events/options`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener las opciones para eventos');
  const json = await res.json();
  return json;
}
