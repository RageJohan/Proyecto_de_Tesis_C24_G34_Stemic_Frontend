import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import { apiFetch } from "../services/api";
import "../styles/EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/events/${id}`)
      .then((data) => setEvent(data.event || data))
      .catch(() => setError("No se pudo cargar el evento"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Cargando evento...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>No se encontró el evento.</div>;

  // Compatibilidad de campos
  const image =
    event.imagen_url ||
    event.image ||
    "https://via.placeholder.com/600x400?text=Evento";
  const title = event.titulo || event.title || "Sin título";
  const desc = event.descripcion || event.description || "";
  const date = event.fecha_hora || event.date || event.fecha || "";
  const duration = event.duracion || event.duration || "";
  const modalidad = event.modalidad || "";
  const espacio = event.espacio || event.lugar || event.location || "";
  const requierePostulacion =
    event.requiere_postulacion || event.requierePostulacion || false;
  const contacto = event.contacto || event.consultas || event.email || "";
  const tags = event.tags || event.etiquetas || [];
  const skills = event.skills || [];

  return (
    <>
      <Header />
      <div className="event-detail-view">
        <div className="event-detail-main-box">
          <div className="event-detail-img-box">
            <img src={image} alt={title} className="event-detail-img" />
          </div>
          <div className="event-detail-info-box">
            <h2 className="event-detail-title">{title}</h2>
            <p className="event-detail-desc">{desc}</p>
            <div className="event-detail-table">
              <div>
                <b>Fecha del evento y hora:</b>{" "}
                <span>{date ? new Date(date).toLocaleString() : ""}</span>
              </div>
              <div>
                <b>Duración:</b> <span>{duration}</span>
              </div>
              <div>
                <b>Modalidad:</b> <span>{modalidad}</span>
              </div>
              <div>
                <b>Espacio de realización:</b> <span>{espacio}</span>
              </div>
              <div>
                <b>Requiere postulación:</b>{" "}
                <span>{requierePostulacion ? "Sí" : "No"}</span>
              </div>
              <div>
                <b>Consultas aquí:</b> <span>{contacto}</span>
              </div>
            </div>
            <div className="event-detail-tags">
              {tags.map((tag, i) => (
                <span className="event-detail-tag" key={i}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="event-detail-section">
          <h3>Información Adicional</h3>
          <p>{event.info_adicional || event.informacion_adicional || desc}</p>
        </div>
        <div className="event-detail-section">
          <h3>Skills del evento</h3>
          <div className="event-detail-skills">
            {skills.length > 0 ? (
              skills.map((skill, i) => (
                <span className="event-detail-skill" key={i}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: "#888" }}>No especificado</span>
            )}
          </div>
        </div>
        <button className="event-detail-back" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </>
  );
}
