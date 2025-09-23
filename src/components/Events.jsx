import React, { useState, useEffect } from "react";
import "../styles/Events.css";

import Header from "./Header";
import { apiFetch } from "../services/api";

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalidades, setModalidades] = useState([]);
  const [modalityFilter, setModalityFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`/api/events/public`)
      .then((data) => {
        let eventos = Array.isArray(data)
          ? data
          : data.data || data.events || [];
        setEvents(eventos);
        setTotal(eventos.length);
        // Extraer modalidades únicas del backend
        const mods = Array.from(
          new Set(eventos.map((ev) => ev.modalidad).filter(Boolean))
        );
        setModalidades(mods);
      })
      .catch((err) => setError("Error al cargar eventos"))
      .finally(() => setLoading(false));
  }, []);

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
        {/* Filtros UI, pero no funcionales aún */}
        <div className="events-filters">
          <input
            className="events-filter-input"
            type="text"
            placeholder="Buscar evento..."
            disabled
          />
          <select className="events-filter-select" disabled>
            <option>Todas las categorías</option>
          </select>
          <select
            className="events-filter-select"
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
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
          </select>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", margin: "2rem" }}>
            Cargando eventos...
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", margin: "2rem" }}>
            {error}
          </div>
        ) : (
          <>
            <div className="events-cards">
              {Array.isArray(events) && events.length === 0 ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  No hay eventos disponibles.
                </div>
              ) : (
                (Array.isArray(events) ? events : [])
                  .filter(
                    (ev) => !modalityFilter || ev.modalidad === modalityFilter
                  )
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((event, idx) => {
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
              total={events.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
