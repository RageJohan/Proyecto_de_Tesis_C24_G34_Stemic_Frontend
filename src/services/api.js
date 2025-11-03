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

/**
 * Obtiene los eventos recomendados para el usuario autenticado.
 * Llama al endpoint GET /api/recommendations/events
 * @returns {Promise<object>} - Una promesa que resuelve con el objeto de respuesta 
 * (ej. { events: [...], total: N, recommendation_type: '...' }).
 * @throws {Error} - Lanza un error si la petición falla (ej. "Sesión expirada").
 */
export async function getRecommendedEvents() {
  const res = await fetchWithAuth(`${API_URL}/api/recommendations/events`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  // El backend devuelve { success: true, data: { events: [], total: 0, ... } }
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.message || 'No se pudieron obtener las recomendaciones');
  }
  
  // Devolvemos el objeto 'data' que contiene los eventos y el total
  return json.data || { events: [], total: 0, recommendation_type: 'unknown' };
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
/**
 * Genera un código QR de asistencia para un evento específico.
 * Requiere rol de organizador o admin.
 * @param {string} eventId - El ID del evento para el cual generar el QR.
 * @returns {Promise<object>} - Una promesa que resuelve con los datos del QR generado, incluyendo la imagen en formato data URL.
 * @throws {Error} - Lanza un error si la petición falla.
 */
export async function generateAttendanceQR(eventId) {
  if (!eventId) {
    throw new Error('El ID del evento es requerido para generar el QR.');
  }
  const res = await fetchWithAuth(`${API_URL}/api/attendance/generate-qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ evento_id: eventId }),
  });

  if (!res.ok) {
    let msg = 'No se pudo generar el código QR';
    try {
      const err = await res.json();
      if (err && err.message) msg = err.message;
    } catch {
      // Ignorar error de parseo
    }
    throw new Error(msg);
  }

  const json = await res.json();
  // Asegúrate de devolver el objeto 'data' que contiene la info del QR
  return json.data || json;
}
/**
 * Obtiene métricas generales del sistema. Accesible para organizadores y admins.
 * GET /api/dashboard/system/metrics
 * @returns {Promise<object>} - Métricas del sistema.
 */
export async function getSystemMetrics() {
  const res = await fetchWithAuth(`${API_URL}/api/dashboard/system/metrics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener las métricas del sistema');
  const json = await res.json();
  return json.data || {}; // El backend devuelve { success: true, data: { ... } }
}

/**
 * Obtiene métricas detalladas de un evento específico.
 * GET /api/dashboard/events/:eventId/metrics
 * Accesible para administradores y organizadores (solo sus eventos).
 * @param {string} eventId - Identificador del evento.
 * @returns {Promise<object>} Métricas del evento.
 */
export async function getEventMetrics(eventId) {
  if (!eventId) {
    throw new Error('El identificador del evento es requerido');
  }

  const res = await fetchWithAuth(`${API_URL}/api/dashboard/events/${eventId}/metrics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    let message = 'No se pudieron obtener las métricas del evento';
    try {
      const error = await res.json();
      if (error && error.message) message = error.message;
    } catch {}
    throw new Error(message);
  }

  const json = await res.json();
  return json.data || {};
}

/**
 * Obtiene los eventos creados por el usuario autenticado (organizador).
 * GET /api/events/user/my-events
 * @returns {Promise<Array<object>>} - Lista de eventos del organizador.
 */
export async function getMyEventsForOrganizer() {
  const res = await fetchWithAuth(`${API_URL}/api/events/user/my-events`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  // Si no hay eventos, el backend puede devolver 204 No Content
  if (res.status === 204) return [];
  if (!res.ok) throw new Error('No se pudieron obtener tus eventos');
  const json = await res.json();
  // El backend devuelve { success: true, data: events, meta: { ... } }
  return json.data || [];
}

/**
 * Obtiene datos de participación de eventos para reportes (organizador/admin).
 * GET /api/reports/participation
 * @param {object} filters - Filtros opcionales (ej: { evento_id: 'uuid' }).
 * @returns {Promise<object>} - Datos y metadatos.
 */
export async function getParticipationData(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetchWithAuth(`${API_URL}/api/reports/participation?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener los datos de participación');
  const json = await res.json();
  // Devuelve { success: true, data: [...], meta: {...} }
  return json;
}

/**
 * Obtiene datos de satisfacción de eventos para reportes (organizador/admin).
 * GET /api/reports/satisfaction
 * @param {object} filters - Filtros opcionales (ej: { evento_id: 'uuid' }).
 * @returns {Promise<object>} - Datos y metadatos.
 */
export async function getSatisfactionData(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetchWithAuth(`${API_URL}/api/reports/satisfaction?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron obtener los datos de satisfacción');
  const json = await res.json();
  // Devuelve { success: true, data: [...], meta: {...} }
  return json;
}

/**
 * Obtiene historial de reportes generados por el usuario (organizador/admin).
 * GET /api/reports/history
 * @returns {Promise<Array<object>>} - Lista de registros del historial.
 */
export async function getReportHistory() {
  const res = await fetchWithAuth(`${API_URL}/api/reports/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudo obtener el historial de reportes');
  const json = await res.json();
  // Devuelve { success: true, data: [...], meta: {...} }
  return json.data || [];
}

// Eliminar evento
export async function deleteEvent(id) {
  const res = await fetchWithAuth(`${API_URL}/api/events/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    let msg = 'No se pudo eliminar el evento';
    try {
      const err = await res.json();
      if (err && err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }
  return await res.json();
}
/**
 * Verifica la asistencia de un usuario enviando el token escaneado de un QR.
 * El usuario debe estar autenticado.
 * El backend (controlador verifyAttendance) valida el token, la inscripción
 * y que no se haya registrado asistencia previa.
 *
 * @param {string} token - El contenido (string) escaneado del QR.
 * @returns {Promise<object>} - La respuesta del servidor (ej. { message: 'Asistencia verificada' }).
 * @throws {Error} Lanza un error si la verificación falla (ej. "QR inválido", "Usuario no inscrito").
 */
export async function verifyAttendance(token) {
  
  const res = await fetchWithAuth(`${API_URL}/api/attendance/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qr_data: token }), // El backend espera el campo "qr_data"
  });

  // Si la respuesta no es OK (ej. 400, 401, 404, 500)
  if (!res.ok) {
    let errorMsg = 'No se pudo verificar la asistencia';
    try {
      // Intentamos leer el mensaje de error específico del backend
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // Si el cuerpo no es JSON, mantenemos el mensaje genérico
    }
    throw new Error(errorMsg);
  }
  
  // Si la respuesta es OK (ej. 200, 201)
  return await res.json();
}

/**
 * Obtiene la estructura de preguntas para las encuestas.
 * GET /api/preguntas-evaluaciones
 * @returns {Promise<Array<object>>} - Una promesa que resuelve con la lista de preguntas.
 */
export async function getEvaluationQuestions() {
  const res = await fetchWithAuth(`${API_URL}/api/preguntas-evaluaciones`, { // <--- ESTA ES LA LÍNEA CORREGIDA
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('No se pudieron cargar las preguntas de la encuesta');
  const json = await res.json();
  
  // Tu backend puede devolver el array directamente o dentro de 'data' o 'preguntas'
  return json.data || json.preguntas || json || [];
}

/**
 * Envía la evaluación (encuesta) para un evento específico.
 * POST /api/evaluations
 * @param {object} evaluationData - Los datos de la evaluación.
 * (ej. { evento_id: 'uuid', respuestas: [...], comentario: '...' })
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta del backend.
 * @throws {Error} - Lanza un error si la petición falla (ej. "Ya has enviado una evaluación").
 */
export async function submitEvaluation(evaluationData) {
  const res = await fetchWithAuth(`${API_URL}/api/evaluaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(evaluationData),
  });

  const json = await res.json();

  if (!res.ok) {
    // Si el backend envía un error (ej. "No se registró tu asistencia"), lo lanzamos
    throw new Error(json.message || 'No se pudo enviar la evaluación');
  }

  return json;
}

// Descargar archivo de reporte
export async function getReportFile({ reportType, format, filters }) {
  const params = new URLSearchParams(filters).toString();
  const url = `${API_URL}/api/reports/${reportType}/${format}?${params}`;

  const res = await fetchWithAuth(url, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Error al descargar el archivo');
  }

  const blob = await res.blob();
  return blob;
}

// Obtener todos los eventos
export async function getAllEvents() {
  const res = await fetchWithAuth(`${API_URL}/api/events`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error('No se pudieron obtener los eventos');
  const json = await res.json();
  return json.data || [];
}

