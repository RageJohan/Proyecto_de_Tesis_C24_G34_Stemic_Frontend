import React, { useState, useEffect, useMemo } from "react"; // Importamos useMemo
import "../styles/Events.css";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
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
  const [events, setEvents] = useState([]); // Todos los eventos de la API
  // const [total, setTotal] = useState(0); // No lo necesitamos para paginación FE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Estados para los filtros ---
  const [modalidades, setModalidades] = useState([]); // Dinámico + 'Virtual'
  const [allTags, setAllTags] = useState([]); // Para el filtro de categorías
  
  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("proximo"); // Opciones: 'proximo', 'semana', 'mes'
  // --- Fin estados para filtros ---

  useEffect(() => {
    setLoading(true);
    setError(null);

    getRecommendedEvents()
      .then((data) => {
        const eventos = data.events || [];
        setEvents(eventos);

        // --- Lógica para poblar los filtros ---

        // 1. Modalidades (Dinámico + 'Virtual' como solicitaste)
        const mods = Array.from(
          new Set(eventos.map((ev) => ev.modalidad).filter(Boolean))
        );
        if (!mods.includes("Virtual")) {
          mods.push("Virtual"); // Añadimos 'Virtual' si no viene de la API
        }
        setModalidades(mods.sort());

        // 2. Categorías (Extrayendo todos los tags únicos)
        const allEventTags = eventos.flatMap(ev => ev.tags || ev.etiquetas || []);
        const uniqueTags = Array.from(new Set(allEventTags));
        setAllTags(uniqueTags.sort());
        
        // --- Fin lógica filtros ---

        if (data.recommendation_type === 'interest_based') {
          console.log("Mostrando eventos recomendados por interés.");
        } else if (data.recommendation_type === 'recent_events') {
          console.log("Mostrando eventos recientes (Define tus intereses para recomendaciones personalizadas).");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar eventos recomendados");
        
        if (err.message.toLowerCase().includes("sesión expirada") || 
            err.message.toLowerCase().includes("token") ||
            err.message.toLowerCase().includes("inicia sesión")) {
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Lógica de filtrado y ordenación con useMemo para eficiencia
  const filteredEvents = useMemo(() => {
    let eventsToFilter = Array.isArray(events) ? [...events] : []; // Copiamos para no mutar
    const now = new Date(); // Para filtrar fechas

    // --- 1. Aplicar Filtros ---

    // Filtro de Búsqueda (por título)
    if (searchTerm) {
      eventsToFilter = eventsToFilter.filter((ev) =>
        (ev.titulo || ev.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de Modalidad
    if (modalityFilter) {
      eventsToFilter = eventsToFilter.filter(
        (ev) => ev.modalidad === modalityFilter
      );
    }

    // Filtro de Categoría (Tags)
    if (categoryFilter) {
      eventsToFilter = eventsToFilter.filter((ev) =>
        (ev.tags || ev.etiquetas || []).includes(categoryFilter)
      );
    }

    // --- 2. Aplicar Filtro/Ordenación por Fecha ---

    // Primero, siempre filtramos eventos pasados y ordenamos por "Más próximo"
    eventsToFilter = eventsToFilter
      .filter((ev) => {
        const eventDateStr = ev.fecha_hora || ev.date || ev.fecha;
        if (!eventDateStr) return false; // Descartar eventos sin fecha
        const eventDate = new Date(eventDateStr);
        return eventDate >= now; // Solo eventos futuros
      })
      .sort((a, b) => {
        // Ordenar ascendente (más próximo primero)
        const dateA = new Date(a.fecha_hora || a.date || a.fecha);
        const dateB = new Date(b.fecha_hora || b.date || b.fecha);
        return dateA - dateB;
      });

    // Si el filtro es "semana" o "mes", aplicamos un filtro de rango adicional
    if (dateFilter === "semana") {
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      eventsToFilter = eventsToFilter.filter((ev) => {
        const eventDate = new Date(ev.fecha_hora || ev.date || ev.fecha);
        return eventDate <= oneWeekFromNow;
      });
    } else if (dateFilter === "mes") {
      // Usamos 30 días desde hoy
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); 
      eventsToFilter = eventsToFilter.filter((ev) => {
        const eventDate = new Date(ev.fecha_hora || ev.date || ev.fecha);
        return eventDate <= oneMonthFromNow;
      });
    }
    // Si dateFilter es "proximo", ya está ordenado y no necesita más filtro.

    return eventsToFilter;
    
  }, [events, searchTerm, modalityFilter, categoryFilter, dateFilter]); // Dependencias del useMemo
    
  // La paginación ahora funciona sobre la lista ya filtrada y ordenada
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
        
        {/* --- Filtros UI (Actualizados) --- */}
        <div className="events-filters">
          <input
            className="events-filter-input"
            type="text"
            placeholder="Buscar evento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Resetear paginación
            }}
          />
          <select 
            className="events-filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {allTags.map((tag, i) => {
              const displayTag = tag.replace(/[{}]/g, "").toUpperCase();
              return (
                <option value={tag} key={i}>
                  {displayTag}
                </option>
              );
            })}
          </select>
          <select
            className="events-filter-select"
            value={modalityFilter}
            onChange={(e) => {
              setModalityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las modalidades</option>
            {modalidades.map((mod, i) => (
              <option value={mod} key={i}>
                {mod}
              </option>
            ))}
          </select>
          <select 
            className="events-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="proximo">Más próximo</option> 
            <option value="semana">Próx. en la semana</option>
            <option value="mes">Próx. en el mes</option>
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
              {filteredEvents.length === 0 ? ( // Usar filteredEvents para el conteo
                <div style={{ textAlign: "center", width: "100%" }}>
                  No hay eventos disponibles que coincidan con tus intereses o filtros.
                </div>
              ) : (
                paginatedEvents.map((event, idx) => { // Usar paginatedEvents para el render
                    const image =
                      event.imagen_url ||
                      event.image ||
                      "https://via.placeholder.com/300x180?text=Evento";
                    const title = event.titulo || event.title || "Sin título";
                    const desc = event.descripcion || event.description || "";
                    const date =
                      event.fecha_hora || event.date || event.fecha || "";
                    const tags = event.tags || event.etiquetas || [];
                    
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
              // El total de la paginación se basa en los eventos *filtrados*
              total={filteredEvents.length} 
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}