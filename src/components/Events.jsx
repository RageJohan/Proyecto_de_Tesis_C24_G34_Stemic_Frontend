import React, { useState, useEffect, useMemo } from "react";
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados filtros
  const [modalidades, setModalidades] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // CORRECCIÓN 1: Cambiamos el valor inicial de dateFilter.
  // Lo gestionaremos en el useEffect tras recibir la data.
  const [dateFilter, setDateFilter] = useState("proximo"); 
  
  // Nuevo estado para saber el tipo de recomendación
  const [recType, setRecType] = useState("recent_events");

  useEffect(() => {
    setLoading(true);
    setError(null);

    getRecommendedEvents()
      .then((data) => {
        const eventos = data.events || [];
        setEvents(eventos);
        
        // CORRECCIÓN 2: Detectamos el tipo de recomendación
        setRecType(data.recommendation_type);

        // Si la recomendación es por intereses, cambiamos el filtro automáticamente a "relevancia"
        if (data.recommendation_type === 'interest_based') {
          setDateFilter("relevancia");
        } else {
          setDateFilter("proximo");
        }

        // Poblar filtros de modalidades
        const mods = Array.from(
          new Set(eventos.map((ev) => ev.modalidad).filter(Boolean))
        );
        if (!mods.includes("Virtual")) {
          mods.push("Virtual");
        }
        setModalidades(mods.sort());

        // Poblar filtros de categorías
        const allEventTags = eventos.flatMap(ev => ev.tags || ev.etiquetas || []);
        const uniqueTags = Array.from(new Set(allEventTags));
        setAllTags(uniqueTags.sort());
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar eventos recomendados");
        if (err.message.toLowerCase().includes("sesión expirada") || 
            err.message.toLowerCase().includes("token")) {
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filteredEvents = useMemo(() => {
    let eventsToFilter = Array.isArray(events) ? [...events] : [];
    const now = new Date();

    // 1. Filtros básicos
    if (searchTerm) {
      eventsToFilter = eventsToFilter.filter((ev) =>
        (ev.titulo || ev.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (modalityFilter) {
      eventsToFilter = eventsToFilter.filter((ev) => ev.modalidad === modalityFilter);
    }
    if (categoryFilter) {
      eventsToFilter = eventsToFilter.filter((ev) =>
        (ev.tags || ev.etiquetas || []).includes(categoryFilter)
      );
    }

    // CORRECCIÓN 3: Separamos el filtrado de fechas del ordenamiento

    // Siempre filtramos eventos pasados para seguridad visual
    eventsToFilter = eventsToFilter.filter((ev) => {
      const eventDateStr = ev.fecha_hora || ev.date || ev.fecha;
      if (!eventDateStr) return false;
      return new Date(eventDateStr) >= now;
    });

    // Lógica de Ordenamiento y Filtros de Rango
    if (dateFilter === "relevancia") {
      // NO ORDENAMOS. Mantenemos el orden que viene del backend (relevancia).
    } else {
      // Para las demás opciones ("proximo", "semana", "mes"), ordenamos por fecha
      eventsToFilter.sort((a, b) => {
        const dateA = new Date(a.fecha_hora || a.date || a.fecha);
        const dateB = new Date(b.fecha_hora || b.date || b.fecha);
        return dateA - dateB;
      });
    }

    // Filtros de rango específicos
    if (dateFilter === "semana") {
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      eventsToFilter = eventsToFilter.filter((ev) => {
        const eventDate = new Date(ev.fecha_hora || ev.date || ev.fecha);
        return eventDate <= oneWeekFromNow;
      });
    } else if (dateFilter === "mes") {
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); 
      eventsToFilter = eventsToFilter.filter((ev) => {
        const eventDate = new Date(ev.fecha_hora || ev.date || ev.fecha);
        return eventDate <= oneMonthFromNow;
      });
    }

    return eventsToFilter;
    
  }, [events, searchTerm, modalityFilter, categoryFilter, dateFilter]); // Dependencias
    
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
        
        <div className="events-filters">
          <input
            className="events-filter-input"
            type="text"
            placeholder="Buscar evento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
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
              return <option value={tag} key={i}>{displayTag}</option>;
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
            {modalidades.map((mod, i) => <option value={mod} key={i}>{mod}</option>)}
          </select>

          {/* CORRECCIÓN 4: Agregamos la opción 'Recomendados' al select */}
          <select 
            className="events-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          >
            {/* Solo tiene sentido mostrar esta opción si hay intereses, 
                pero dejarla siempre visible es buena UX para saber qué filtro está activo */}
            <option value="relevancia">Recomendados</option>
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
              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  No hay eventos disponibles que coincidan con tus intereses o filtros.
                </div>
              ) : (
                paginatedEvents.map((event, idx) => {
                    const image = event.imagen_url || event.image || "https://via.placeholder.com/300x180?text=Evento";
                    const title = event.titulo || event.title || "Sin título";
                    const desc = event.descripcion || event.description || "";
                    const date = event.fecha_hora || event.date || event.fecha || "";
                    const tags = event.tags || event.etiquetas || [];
                    
                    return (
                      <div
                        className="event-card"
                        key={event.id || event._id || idx}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/event/${event.id || event._id}`)}
                      >
                        <div className="event-card-img-box">
                          <img src={image} alt={title} className="event-card-img" />
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
                                  <span className={`event-card-tag tag-${i}`} key={i}>
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
              total={filteredEvents.length} 
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}