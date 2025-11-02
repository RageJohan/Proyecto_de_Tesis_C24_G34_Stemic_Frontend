import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importar Link y useNavigate
import Header from "./Header";
import "../styles/Participations.css";
import { getMyInscriptions } from "../services/api";

export default function Participations() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegar

  useEffect(() => {
    setLoading(true);
    getMyInscriptions()
      .then((data) => {
        // =======================================================
        // NUEVO: Filtramos las inscripciones que han sido "canceladas"
        // para que solo se muestren las participaciones activas.
        // =======================================================
        const activeParticipations = data.filter(
          (p) => p.estado !== "cancelada"
        );
        setParticipations(activeParticipations);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar tus participaciones. " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Función para determinar si el evento ya pasó
  const hasEventFinished = (eventDateStr) => {
    if (!eventDateStr) return false;
    const eventDate = new Date(eventDateStr);
    const now = new Date();
    return eventDate < now;
  };

  return (
    <>
      <Header />
      <div className="participations-view">
        <h2 className="participations-title">Mis Participaciones</h2>
        {loading && <div>Cargando...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="participations-table-box">
          <table className="participations-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha, Hora</th>
                <th>Modalidad</th>
                {/* Columna de Estado ELIMINADA */}
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {participations.length === 0 && !loading ? (
                <tr>
                  {/* ColSpan actualizado a 4 */}
                  <td colSpan={4}>No tienes participaciones registradas.</td>
                </tr>
              ) : (
                participations.map((p, idx) => {
                  const evento = p.evento || p.event || {};
                  const eventoId = evento.id || p.evento_id;
                  
                  const eventoTitulo = evento.titulo || p.evento_titulo;
                  const eventoFecha = evento.fecha_hora || p.evento_fecha;
                  const eventoModalidad = evento.modalidad || p.evento_modalidad;

                  return (
                    <tr key={p.id || idx}>
                      {/* 1. Evento (con Link) */}
                      <td>
                        <Link to={`/event/${eventoId}`}>
                          {eventoTitulo || "Sin título"}
                        </Link>
                      </td>
                      {/* 2. Fecha, Hora */}
                      <td>
                        {eventoFecha
                          ? new Date(eventoFecha).toLocaleString()
                          : "N/A"}
                      </td>
                      {/* 3. Modalidad */}
                      <td>{eventoModalidad || "N/A"}</td>
                      
                      {/* Columna de Estado ELIMINADA */}

                      {/* 4. Acción (Encuesta) - Lógica simplificada */}
                      <td>
                        {
                        // Como ya filtramos las canceladas,
                        // solo necesitamos saber si el evento ha terminado.
                        hasEventFinished(eventoFecha) ? (
                          <button
                            className="btn-evaluate"
                            onClick={() => navigate(`/survey/${eventoId}`)}
                          >
                            Evaluar
                          </button>
                        ) : (
                          <span className="evaluate-na">
                            No disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}