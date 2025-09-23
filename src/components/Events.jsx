import React, { useState } from "react";
import "../styles/Events.css";
import joinUsImg from "../assets/JoinUs1.JPG";
import reactLogo from "../assets/react.svg";
import Header from "./Header";

const events = [
  {
    date: "20/06/2025",
    image: joinUsImg,
    title: "LEAD IBM EXPLORE DAY",
    description: "Un evento dinámico y colaborativo en el que estudiantes con interés en tecnología y liderazgo participan en charlas, workshops y networking con expertos de la industria. ¡Prepárate a crecer y conectar!",
    tags: ["Tech", "Líder", "Networking"],
    modalidad: "Presencial",
  },
  {
    date: "22/07/2025",
    image: reactLogo,
    title: "HACKATHON STEMIC",
    description: "Competencia de innovación y tecnología para estudiantes apasionados por resolver retos reales en equipo.",
    tags: ["Hackathon", "Innovación", "STEM"],
    modalidad: "Virtual",
  },
  {
    date: "05/08/2025",
    image: joinUsImg,
    title: "BOOTCAMP DE LIDERAZGO",
    description: "Taller intensivo para desarrollar habilidades de liderazgo, comunicación y trabajo en equipo.",
    tags: ["Liderazgo", "Bootcamp", "Soft Skills"],
    modalidad: "Híbrido",
  },
  {
    date: "15/09/2025",
    image: reactLogo,
    title: "MEETUP DE TECNOLOGÍA",
    description: "Encuentro mensual para compartir experiencias, aprender de expertos y hacer networking en tecnología.",
    tags: ["Meetup", "Tech", "Networking"],
    modalidad: "Virtual",
  },
  {
    date: "30/09/2025",
    image: joinUsImg,
    title: "JORNADA DE INNOVACIÓN",
    description: "Jornada de talleres y charlas sobre innovación, creatividad y emprendimiento en STEM.",
    tags: ["Innovación", "Emprendimiento", "STEM"],
    modalidad: "Híbrido",
  },
];

const PAGE_SIZE = 6;

function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="events-pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>&lt;</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={page === i + 1 ? "active" : ""}
          onClick={() => onPageChange(i + 1)}
        >{i + 1}</button>
      ))}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>&gt;</button>
    </div>
  );
}

const allTags = Array.from(new Set(events.flatMap(e => e.tags)));
const allModalidades = Array.from(new Set(events.map(e => e.modalidad)));

export default function Events() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [orden, setOrden] = useState("proximo");

  // Filtros simulados
  let filtered = events.filter(e =>
    (!search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase())) &&
    (!categoria || e.tags.includes(categoria)) &&
    (!modalidad || e.modalidad === modalidad)
  );
  filtered = filtered.sort((a, b) => {
    const da = a.date.split("/").reverse().join("-");
    const db = b.date.split("/").reverse().join("-");
    if (orden === "proximo") return da.localeCompare(db);
    else return db.localeCompare(da);
  });
  const pagedEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="events-view">
        <h2 className="events-title">
          Próximos Eventos <span className="events-sub">| Enterate de los próximos eventos y regístrate</span>
        </h2>
        <div className="events-filters">
          <input
            className="events-filter-input"
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="events-filter-select" value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1); }}>
            <option value="">Todas las categorías</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <select className="events-filter-select" value={modalidad} onChange={e => { setModalidad(e.target.value); setPage(1); }}>
            <option value="">Todas las modalidades</option>
            {allModalidades.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="events-filter-select" value={orden} onChange={e => { setOrden(e.target.value); setPage(1); }}>
            <option value="proximo">Más próximo</option>
            <option value="lejano">Más lejano</option>
          </select>
        </div>
        <div className="events-cards">
          {pagedEvents.map((event, idx) => (
            <div className="event-card" key={idx}>
              <div className="event-card-img-box">
                <img src={event.image} alt={event.title} className="event-card-img" />
                <div className="event-card-date">{event.date}</div>
              </div>
              <div className="event-card-content">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-desc">{event.description}</p>
                <div className="event-card-tags">
                  {event.tags.map((tag, i) => (
                    <span className={`event-card-tag tag-${i}`} key={i}>{tag}</span>
                  ))}
                </div>
                <div className="event-card-modality">{event.modalidad}</div>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} total={filtered.length} onPageChange={setPage} />
      </div>
    </>
  );
}
