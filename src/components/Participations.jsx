import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/Participations.css";
import { getMyInscriptions } from "../services/api";

export default function Participations() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMyInscriptions()
      .then((data) => {
        setParticipations(data);
      })
      .catch(() => setError("No se pudieron cargar tus participaciones"))
      .finally(() => setLoading(false));
  }, []);

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
              </tr>
            </thead>
            <tbody>
              {participations.length === 0 && !loading ? (
                <tr><td colSpan={3}>No tienes participaciones registradas.</td></tr>
              ) : (
                participations.map((p, idx) => {
                  const evento = p.evento || p.event || {};
                  return (
                    <tr key={idx}>
                      <td>{evento.titulo || evento.title || "Sin título"}</td>
                      <td>{evento.fecha_hora ? new Date(evento.fecha_hora).toLocaleString() : ""}</td>
                      <td>{evento.modalidad || ""}</td>
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
