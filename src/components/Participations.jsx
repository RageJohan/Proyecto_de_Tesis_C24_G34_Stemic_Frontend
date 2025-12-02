import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import "../styles/Participations.css";
import { getMyInscriptions, cancelarInscripcionEvento } from "../services/api";

export default function Participations() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = () => {
    setLoading(true);
    getMyInscriptions()
      .then((data) => {
        // Filtrar inscripciones canceladas
        const activeParticipations = data.filter(
          (p) => p.estado !== "cancelada"
        );
        // Ordenar por fecha (más recientes primero)
        activeParticipations.sort((a, b) => {
          const dateA = new Date(a.evento?.fecha_hora || a.evento_fecha);
          const dateB = new Date(b.evento?.fecha_hora || b.evento_fecha);
          return dateB - dateA;
        });
        setParticipations(activeParticipations);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar tus participaciones.");
      })
      .finally(() => setLoading(false));
  };

  const handleCancelInscription = async (eventId, eventTitle) => {
    const confirm = window.confirm(
      `¿Estás seguro que deseas cancelar tu participación en "${eventTitle}"?`
    );

    if (!confirm) return;

    try {
      await cancelarInscripcionEvento(eventId);
      // Eliminar visualmente la inscripción cancelada
      setParticipations((prev) => 
        prev.filter((p) => {
            const pId = p.evento?.id || p.event?.id || p.evento_id;
            return pId !== eventId;
        })
      );
      alert("Inscripción cancelada exitosamente.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al cancelar la inscripción.");
    }
  };

  const hasEventFinished = (eventDateStr) => {
    if (!eventDateStr) return false;
    const eventDate = new Date(eventDateStr);
    const now = new Date();
    return eventDate < now;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <div className="participations-view">
        <div className="participations-container">
          <h2 className="participations-title">Mis Participaciones</h2>

          {loading && <div className="state-message">Cargando tus eventos...</div>}
          {error && <div className="state-message error">{error}</div>}

          {!loading && !error && (
            <div className="participations-table-box">
              <table className="participations-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Fecha</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-message">
                        No tienes participaciones activas. <br/>
                        <Link to="/events" className="link-explore">Ver eventos disponibles</Link>
                      </td>
                    </tr>
                  ) : (
                    participations.map((p, idx) => {
                      const evento = p.evento || p.event || {};
                      const eventoId = evento.id || p.evento_id;
                      const eventoTitulo = evento.titulo || p.evento_titulo;
                      const eventoFecha = evento.fecha_hora || p.evento_fecha;
                      const eventoModalidad = evento.modalidad || p.evento_modalidad;
                      
                      const isFinished = hasEventFinished(eventoFecha);

                      return (
                        <tr key={p.id || idx}>
                          <td className="col-event">
                            <Link to={`/event/${eventoId}`} className="event-link">
                              {eventoTitulo || "Sin título"}
                            </Link>
                          </td>
                          <td>
                            <div className="date-wrapper">
                              <span className="date-date">{formatDate(eventoFecha)}</span>
                              <span className="date-time">{formatTime(eventoFecha)}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge modality-${eventoModalidad?.toLowerCase()}`}>
                              {eventoModalidad || "N/A"}
                            </span>
                          </td>
                          <td>
                             <span className={`badge status-${isFinished ? 'finished' : 'upcoming'}`}>
                               {isFinished ? "Finalizado" : "Próximo"}
                             </span>
                          </td>
                          <td>
                            {isFinished ? (
                              <button
                                className="btn-action btn-evaluate"
                                onClick={() => navigate(`/survey/${eventoId}`)}
                              >
                                Evaluar
                              </button>
                            ) : (
                              <button
                                className="btn-action btn-cancel"
                                onClick={() => handleCancelInscription(eventoId, eventoTitulo)}
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}