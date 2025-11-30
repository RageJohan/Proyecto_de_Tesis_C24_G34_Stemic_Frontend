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
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
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
        setError(err.message || "No se pudieron obtener los eventos");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

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
        setError(err.message || "Error al cargar datos");
        showNotification(err.message, "error");
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
      showNotification("Error al actualizar estado", "error");
    }
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.page + direction), pagination.totalPages || 1),
    }));
  };

  return (
    <Layout>
      <div className="event-postulations-panel">
        
        {/* Header Blanco */}
        <header className="event-postulations-header">
          <h1>Gestión de Postulaciones</h1>
          <p>Supervisión de candidatos y revisión de respuestas.</p>
        </header>

        {/* Filtros */}
        <div className="filters-toolbar">
          <div className="filter-group">
            <label>Evento</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={loadingEvents || events.length === 0}
              className="modern-select"
            >
              {events.length === 0 ? <option value="">Cargando eventos...</option> : 
                events.map((ev) => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)
              }
            </select>
          </div>

          <div className="filter-group">
            <label>Buscar Participante</label>
            <input
              type="search"
              placeholder="Nombre, correo..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="modern-input"
            />
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value, page: 1 }))}
              className="modern-select"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div style={{color: '#f87171', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem'}}>{error}</div>}

        {/* Stats - Texto Blanco con Dots de color */}
        {stats && (
          <div className="postulation-status-grid">
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#38bdf8'}}><div className="stat-dot"></div> Total</span>
              <span className="stat-value">{stats.total || 0}</span>
            </div>
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#fbbf24'}}><div className="stat-dot"></div> Pendientes</span>
              <span className="stat-value">{stats.pendientes || 0}</span>
            </div>
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#60a5fa'}}><div className="stat-dot"></div> Revisión</span>
              <span className="stat-value">{stats.en_revision || 0}</span>
            </div>
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#c084fc'}}><div className="stat-dot"></div> Preselección</span>
              <span className="stat-value">{stats.preseleccionados || 0}</span>
            </div>
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#4ade80'}}><div className="stat-dot"></div> Aprobados</span>
              <span className="stat-value">{stats.aprobados || 0}</span>
            </div>
            <div className="postulation-stat-item">
              <span className="stat-label" style={{color: '#f87171'}}><div className="stat-dot"></div> Rechazados</span>
              <span className="stat-value">{stats.rechazados || 0}</span>
            </div>
          </div>
        )}

        {/* Tabla - Bordes transparentes y texto blanco */}
        <div className="event-postulations-table-wrapper">
          {loading ? (
            <div style={{padding: '3rem', textAlign: 'center', color: '#cbd5e1'}}>
              <div className="spinner" style={{marginBottom: '1rem'}}></div>
              Cargando datos...
            </div>
          ) : postulations.length === 0 ? (
            <div style={{padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '1rem'}}>
              {selectedEvent ? "No se encontraron postulaciones." : "Selecciona un evento para ver los datos."}
            </div>
          ) : (
            <>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Fecha Registro</th>
                    <th style={{textAlign: 'center'}}>Estado</th>
                    <th style={{textAlign: 'right'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulations.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">{item.usuario?.nombre || "N/A"}</span>
                          <span className="user-email">{item.usuario?.correo}</span>
                        </div>
                      </td>
                      <td>
                        {item.fecha_postulacion ? new Date(item.fecha_postulacion).toLocaleDateString("es-PE", {day: '2-digit', month: 'short', year: 'numeric'}) : "-"}
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <div className={`status-badge-container status-${item.estado}`}>
                          <select
                            value={item.estado}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="status-select-badge"
                          >
                            {STATUS_OPTIONS.filter(o => o.value).map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button className="action-btn" onClick={() => setViewing(item)}>Ver Respuestas</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="pagination-footer">
                <span>Página {pagination.page} de {pagination.totalPages}</span>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button 
                    className="page-btn" 
                    onClick={() => handlePageChange(-1)} 
                    disabled={filters.page <= 1}
                  >
                    &lt;
                  </button>
                  <button 
                    className="page-btn" 
                    onClick={() => handlePageChange(1)} 
                    disabled={filters.page >= pagination.totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal - Fondo Blanco (Excepción para legibilidad) */}
      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{margin:0, fontSize: '1.25rem', color: '#0f172a'}}>Detalle de Postulación</h2>
              <button onClick={() => setViewing(null)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#64748b'}}>×</button>
            </div>
            <div className="modal-content-scroll" style={{padding: '2rem', overflowY: 'auto'}}>
              <div style={{marginBottom: '2rem'}}>
                <h3 style={{margin: '0', color: '#0284c7'}}>{viewing.usuario?.nombre}</h3>
                <p style={{margin: '0.25rem 0 0', color: '#64748b'}}>{viewing.usuario?.correo}</p>
              </div>
              
              <h4 style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', color: '#334155', marginTop: 0}}>Cuestionario</h4>
              {(() => {
                 const dict = getQuestionDictionary(viewing.schema_snapshot);
                 const entries = Object.entries(viewing.responses || {});
                 if (!entries.length) return <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin respuestas adicionales.</p>;
                 return entries.map(([k, v]) => (
                   <div key={k} style={{marginBottom: '1rem'}}>
                     <div style={{fontWeight: 600, color: '#334155', fontSize: '0.9rem', marginBottom: '0.25rem'}}>{dict[k] || k}</div>
                     <div style={{color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem'}}>{formatValue(v)}</div>
                   </div>
                 ));
              })()}
            </div>
            <div className="modal-footer" style={{padding: '1.5rem', textAlign: 'right', borderTop: '1px solid #e2e8f0'}}>
              <button 
                onClick={() => setViewing(null)}
                style={{background: '#0ea5e9', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'}}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};