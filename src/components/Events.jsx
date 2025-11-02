import React, { useState, useEffect } from "react";
import "../styles/Events.css";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
// Importamos la nueva función 'getRecommendedEvents' en lugar de 'apiFetch'
import { getRecommendedEvents } from "../services/api";

const PAGE_SIZE = 6;

function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="events-pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={page === i + 1 ? "active" : ""}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        &gt;
      </button>
    </div>
  );
}

export default function Events() {
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0); // El total ahora vendrá de la API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalidades, setModalidades] = useState([]);
  const [modalityFilter, setModalityFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Usamos la nueva función autenticada 'getRecommendedEvents'
    getRecommendedEvents()
      .then((data) => {
        // La 'data' ahora es un objeto: { events: [...], total: N, recommendation_type: '...' }
        const eventos = data.events || [];
        const totalEventos = data.total || 0;

        setEvents(eventos);
        // Usamos el total de la paginación que provee el backend
        setTotal(totalEventos);

        // Extraer modalidades únicas del backend
        const mods = Array.from(
          new Set(eventos.map((ev) => ev.modalidad).filter(Boolean))
        );
        setModalidades(mods);

        // Opcional: Log para saber qué tipo de recomendación se está mostrando
        if (data.recommendation_type === 'interest_based') {
          console.log("Mostrando eventos recomendados por interés.");
        } else if (data.recommendation_type === 'recent_events') {
          console.log("Mostrando eventos recientes (Define tus intereses para recomendaciones personalizadas).");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar eventos recomendados");
        
        // Si el error es por falta de autenticación (detectado por fetchWithAuth),
        // redirigimos al login.
        if (err.message.toLowerCase().includes("sesión expirada") || 
            err.message.toLowerCase().includes("token") ||
            err.message.toLowerCase().includes("inicia sesión")) {
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]); // Añadimos navigate como dependencia

  // Lógica de paginación y filtrado (el filtrado de modalidad sigue siendo en frontend)
  const filteredEvents = (Array.isArray(events) ? events : [])
    .filter((ev) => !modalityFilter || ev.modalidad === modalityFilter);
    
  // La paginación ahora la gestiona el backend, pero si queremos paginar en frontend 
  // sobre los resultados filtrados, mantenemos el slice.
  // Nota: Lo ideal sería pasar los filtros (ej. modalidad) a la API 
  // para que el backend haga todo el trabajo.
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <>
      <Header />
      <div className="events-view">
        <h2 className="events-title">
          Próximos Eventos{" "}
          <span className="events-sub">
            | Entérate de los próximos eventos y regístrate
          </span>
        </h2>
        {/* Filtros UI */}
        <div className="events-filters">
          <input
            className="events-filter-input"
            type="text"
            placeholder="Buscar evento..."
            disabled // La API de recomendación no soporta búsqueda de texto aún
          />
          <select className="events-filter-select" disabled>
            <option>Todas las categorías</option>
          </select>
          <select
            className="events-filter-select"
            value={modalityFilter}
            onChange={(e) => {
              setModalityFilter(e.target.value);
              setPage(1); // Resetear paginación al cambiar filtro
            }}
          >
            <option value="">Todas las modalidades</option>
            {modalidades.map((mod, i) => (
              <option value={mod} key={i}>
                {mod}
              </option>
            ))}
          </select>
          <select className="events-filter-select" disabled>
            <option>Más próximo</option> 
            {/* La API ya ordena por relevancia y fecha */}
          </select>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            Cargando eventos recomendados...
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", margin: "2rem" }}>
            {error}
          </div>
        ) : (
          <>
            <div className="events-cards">
              {filteredEvents.length === 0 ? ( // Usar filteredEvents.length para el mensaje
                <div style={{ textAlign: "center", width: "100%" }}>
                  No hay eventos disponibles que coincidan con tus intereses o filtros.
                </div>
              ) : (
                paginatedEvents.map((event, idx) => { // Usar paginatedEvents para el map
                    const image =
                      event.imagen_url ||
                      event.image ||
                      "https://via.placeholder.com/300x180?text=Evento";
                    const title = event.titulo || event.title || "Sin título";
                    const desc = event.descripcion || event.description || "";
                    const date =
                      event.fecha_hora || event.date || event.fecha || "";
                    const tags = event.tags || event.etiquetas || [];
                    
                    // Opcional: Resaltar visualmente por qué es recomendado
                    const relevance = event.relevancia || 0; 
                    const matches = event.intereses_coincidentes || 0;

                    return (
                      <div
                        className="event-card"
                        key={event.id || event._id || idx}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/event/${event.id || event._id}`)}
                      >
                        <div className="event-card-img-box">
                          <img
                            src={image}
                            alt={title}
                            className="event-card-img"
                          />
                          <div className="event-card-date">
                            {date ? new Date(date).toLocaleDateString() : ""}
                          </div>
                        </div>
                        <div className="event-card-content">
                          <h3 className="event-card-title">{title}</h3>
                          <p className="event-card-desc">{desc}</p>
                          <div className="event-card-tags">
                            {Array.isArray(tags) && tags.length > 0
                              ? tags.map((tag, i) => (
                                  <span
                                    className={`event-card-tag tag-${i}`}
                                    key={i}
                                  >
                                    {tag}
                                  </span>
                                ))
                              : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            <Pagination
              page={page}
              // El total de la paginación debe basarse en los eventos filtrados
              total={filteredEvents.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}