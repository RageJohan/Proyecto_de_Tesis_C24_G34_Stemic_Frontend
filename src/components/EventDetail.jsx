import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import { apiFetch, inscribirseEvento, cancelarInscripcionEvento, estadoInscripcionEvento } from "../services/api";
import "../styles/EventDetail.css";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [inscripcionMsg, setInscripcionMsg] = useState("");
  const [inscrito, setInscrito] = useState(false);

  const handleInscribirse = async () => {
    setInscribiendo(true);
    setInscripcionMsg("");
    try {
      await inscribirseEvento(id);
      setInscripcionMsg("¡Inscripción exitosa!");
      setInscrito(true);
    } catch (e) {
      setInscripcionMsg(e.message || "Error al inscribirse");
    } finally {
      setInscribiendo(false);
    }
  };

  const handleCancelarInscripcion = async () => {
    setInscribiendo(true);
    setInscripcionMsg("");
    try {
      await cancelarInscripcionEvento(id);
      setInscripcionMsg("Inscripción cancelada");
      setInscrito(false);
    } catch (e) {
      setInscripcionMsg(e.message || "Error al cancelar inscripción");
    } finally {
      setInscribiendo(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    Promise.all([
      apiFetch(`/api/events/public/${id}`),
      estadoInscripcionEvento(id)
    ])
      .then(([eventData, isInscribed]) => {
        setEvent(eventData.data || eventData.event || eventData);
        setInscrito(isInscribed);
      })
      .catch(() => setError("No se pudo cargar el evento"))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate]);

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
  <div className="event-detail-view" style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)', padding: '2rem', background: 'none' }}>
        <div className="event-detail-main-box" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="event-detail-img-box" style={{ flex: '1 1 320px', textAlign: 'center' }}>
            <img src={image} alt={title} className="event-detail-img" style={{ maxWidth: 400, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
            <div style={{ marginTop: 12, fontWeight: 600, color: '#bf2a52', fontSize: '1.1em' }}>
              {date ? new Date(date).toLocaleString() : ""}
            </div>
          </div>
          <div className="event-detail-info-box" style={{ flex: '2 1 400px' }}>
            <h2 className="event-detail-title" style={{ fontSize: '2.2em', color: '#bf2a52', marginBottom: 8 }}>{title}</h2>
            <p className="event-detail-desc" style={{ fontSize: '1.15em', color: '#fff', marginBottom: 18 }}>{desc}</p>
            <div className="event-detail-table" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '1rem', marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}><b>Duración:</b> <span>{duration}</span></div>
              <div style={{ marginBottom: 8 }}><b>Modalidad:</b> <span>{modalidad}</span></div>
              <div style={{ marginBottom: 8 }}><b>Espacio:</b> <span>{espacio}</span></div>
              <div style={{ marginBottom: 8 }}><b>Requiere postulación:</b> <span style={{ color: requierePostulacion ? '#d93240' : '#00796b', fontWeight: 600 }}>{requierePostulacion ? "Sí" : "No"}</span></div>
              <div style={{ marginBottom: 8 }}><b>Consultas:</b> <span>{contacto}</span></div>
            </div>
            <div className="event-detail-tags" style={{ marginBottom: 12 }}>
              {tags.map((tag, i) => (
                <span className="event-detail-tag" key={i} style={{ background: '#e0f7fa', color: '#00796b', borderRadius: 16, padding: '4px 12px', marginRight: 6, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="event-detail-section" style={{ marginTop: 32 }}>
          <h3 style={{ color: '#bf2a52', marginBottom: 8 }}>Información Adicional</h3>
          <p style={{ color: '#fff', fontSize: '1.05em' }}>{event.info_adicional || event.informacion_adicional || desc}</p>
        </div>
        <div className="event-detail-section" style={{ marginTop: 24 }}>
          <h3 style={{ color: '#bf2a52', marginBottom: 8 }}>Skills del evento</h3>
          <div className="event-detail-skills">
            {skills.length > 0 ? (
              skills.map((skill, i) => (
                <span className="event-detail-skill" key={i} style={{ background: '#bf2a52', color: '#fff', borderRadius: 16, padding: '4px 12px', marginRight: 6, fontWeight: 500 }}>{skill}</span>
              ))
            ) : (
              <span style={{ color: "#888" }}>No especificado</span>
            )}
          </div>
        </div>
        {!requierePostulacion && (
          inscrito ? (
            <button
              className="event-detail-back"
              style={{ marginTop: 32, background: '#d93240', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontSize: '1.1em', fontWeight: 600, cursor: 'pointer' }}
              onClick={handleCancelarInscripcion}
              disabled={inscribiendo}
            >
              {inscribiendo ? "Cancelando..." : "Cancelar Inscripción"}
            </button>
          ) : (
            <button
              className="event-detail-back"
              style={{ marginTop: 32, background: '#00796b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontSize: '1.1em', fontWeight: 600, cursor: 'pointer' }}
              onClick={handleInscribirse}
              disabled={inscribiendo}
            >
              {inscribiendo ? "Inscribiendo..." : "Inscribirse"}
            </button>
          )
        )}
        {inscripcionMsg && (
          <div style={{ marginTop: 12, color: inscripcionMsg.includes('exitosa') ? '#00796b' : '#d93240', fontWeight: 600 }}>
            {inscripcionMsg}
          </div>
        )}
        <button className="event-detail-back" style={{ marginTop: 32, background: '#bf2a52', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 2rem', fontSize: '1.1em', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </>
  );
}
