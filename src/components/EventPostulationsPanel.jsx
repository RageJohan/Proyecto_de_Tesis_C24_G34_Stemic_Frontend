import { useEffect, useMemo, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import OrganizerSidebar from "./OrganizerSidebar";
import {
  getAllEvents,
  getEventPostulations,
  updateEventPostulationStatus,
} from "../services/api";
import "../styles/EventPostulationsPanel.css";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "preseleccionado", label: "Preseleccionado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

const getQuestionDictionary = (schemaSnapshot) => {
  if (!schemaSnapshot || typeof schemaSnapshot !== "object") return {};
  const entries = {};
  const pages = schemaSnapshot.pages || [];
  pages.forEach((page) => {
    (page.elements || []).forEach((element) => {
      if (element.name) {
        entries[element.name] = element.title || element.name;
      }
    });
  });
  return entries;
};

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

export default function EventPostulationsPanel() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const isAdmin = user?.rol === "admin";
  const Layout = useMemo(() => (isAdmin ? AdminSidebar : OrganizerSidebar), [isAdmin]);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ estado: "", search: "", page: 1, limit: 10 });
  const [postulations, setPostulations] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10, total: 0 });
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      setError("");
      try {
        const list = await getAllEvents();
        setEvents(list);
        setSelectedEvent((prev) => {
          if (prev && list.some((event) => event.id === prev)) return prev;
          return list?.[0]?.id || "";
        });
      } catch (err) {
        const message = err.message || "No se pudieron obtener los eventos";
        setError(message);
        showNotification(message, "error");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [showNotification]);

  useEffect(() => {
    if (!selectedEvent) {
      setPostulations([]);
      setStats(null);
      return;
    }

    const fetchPostulations = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, stats: summary, pagination: meta } = await getEventPostulations(selectedEvent, filters);
        setPostulations(data || []);
        setStats(summary || null);
        setPagination({
          page: meta?.page || filters.page,
          totalPages: meta?.totalPages || 1,
          limit: meta?.limit || filters.limit,
          total: meta?.total || 0,
        });
      } catch (err) {
        const message = err.message || "No se pudieron cargar las postulaciones";
        setError(message);
        showNotification(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPostulations();
  }, [selectedEvent, filters, showNotification]);

  const handleStatusChange = async (postulationId, estado) => {
    try {
      await updateEventPostulationStatus(selectedEvent, postulationId, { estado });
      showNotification("Estado actualizado", "success");
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      showNotification(err.message || "No se pudo actualizar la postulación", "error");
    }
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.page + direction), pagination.totalPages || 1),
    }));
  };

  const renderResponses = (record) => {
    const dictionary = getQuestionDictionary(record.schema_snapshot);
    const entries = Object.entries(record.responses || {});

    if (entries.length === 0) {
      return <p>No hay respuestas registradas.</p>;
    }

    return (
      <ul className="event-postulations-modal-list">
        {entries.map(([key, value]) => (
          <li key={key}>
            <strong>{dictionary[key] || key}</strong>
            <span>{formatValue(value)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Layout>
      <div className="event-postulations-panel">
        <div className="event-postulations-header">
          <div>
            <h1>Postulaciones por evento</h1>
            <p>Gestiona y revisa las respuestas personalizadas enviados por los participantes.</p>
          </div>
          <div className="event-postulations-controls">
            <label>
              Evento
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={loadingEvents || events.length === 0}
              >
                {events.length === 0 ? (
                  <option value="">No hay eventos disponibles</option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.titulo}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              Estado
              <select
                value={filters.estado}
                onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value, page: 1 }))}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Buscar
              <input
                type="search"
                placeholder="Nombre, correo o palabra clave"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </label>
          </div>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        {stats && (
          <div className="postulation-status-grid" style={{ marginTop: 0 }}>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#22d3ee" }}>Totales</span>
              <span className="postulation-status-value">{stats.total || 0}</span>
            </div>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#fbbf24" }}>Pendientes</span>
              <span className="postulation-status-value">{stats.pendientes || 0}</span>
            </div>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#38bdf8" }}>En revisión</span>
              <span className="postulation-status-value">{stats.en_revision || 0}</span>
            </div>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#a855f7" }}>Preseleccionadas</span>
              <span className="postulation-status-value">{stats.preseleccionados || 0}</span>
            </div>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#34d399" }}>Aprobadas</span>
              <span className="postulation-status-value">{stats.aprobados || 0}</span>
            </div>
            <div className="postulation-status-card">
              <span className="postulation-status-label" style={{ color: "#ef4444" }}>Rechazadas</span>
              <span className="postulation-status-value">{stats.rechazados || 0}</span>
            </div>
          </div>
        )}

        <div className="event-postulations-table-wrapper">
          {loading ? (
            <div className="orgs-loading" style={{ padding: "2rem" }}>Cargando postulaciones...</div>
          ) : postulations.length === 0 ? (
            <div className="orgs-empty" style={{ padding: "2rem" }}>
              {selectedEvent ? "No hay postulaciones que coincidan con los filtros." : "Selecciona un evento."}
            </div>
          ) : (
            <table className="admin-events-table">
              <thead>
                <tr>
                  <th>Postulante</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {postulations.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="postulation-user">
                        <span className="postulation-user-name">{record.usuario?.nombre || "Sin nombre"}</span>
                        <span className="postulation-user-email">{record.usuario?.correo || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        value={record.estado}
                        onChange={(e) => handleStatusChange(record.id, e.target.value)}
                        className={`status-select status-${record.estado}`}
                      >
                        {STATUS_OPTIONS.filter((opt) => opt.value).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{record.fecha_postulacion ? new Date(record.fecha_postulacion).toLocaleString("es-PE") : "—"}</td>
                    <td>
                      <button className="admin-events-btn edit" onClick={() => setViewing(record)}>
                        Ver respuestas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {postulations.length > 0 && (
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={filters.page <= 1}
            >
              Anterior
            </button>
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(1)}
              disabled={filters.page >= pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {viewing && (
        <div className="event-postulations-modal">
          <div className="event-postulations-modal-content">
            <button className="event-postulations-modal-close" onClick={() => setViewing(null)}>
              ×
            </button>
            <h2>Respuestas de {viewing.usuario?.nombre || "Participante"}</h2>
            <div className="event-postulations-modal-body">{renderResponses(viewing)}</div>
          </div>
        </div>
      )}
    </Layout>
  );
}
