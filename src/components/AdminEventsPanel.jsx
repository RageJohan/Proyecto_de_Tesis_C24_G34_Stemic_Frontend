import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/AdminEventsPanel.css";
import { getEvents } from "../services/api";

export default function AdminEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then((data) => setEvents(data))
      .catch(() => setError("No se pudieron cargar los eventos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="admin-events-container fade-in-uniform">
        <h1 className="admin-events-title">Panel de administración de eventos</h1>
        {loading ? (
          <div className="orgs-loading">Cargando eventos...</div>
        ) : error ? (
          <div className="orgs-error">{error}</div>
        ) : events.length === 0 ? (
          <div className="orgs-empty">No hay eventos registrados.</div>
        ) : (
          <table className="admin-events-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.titulo}</td>
                  <td>{new Date(ev.fecha_hora).toLocaleString()}</td>
                  <td>{ev.modalidad}</td>
                  <td>{ev.descripcion}</td>
                  <td>
                    <div className="admin-events-actions">
                      <button className="admin-events-btn edit">Editar</button>
                      <button className="admin-events-btn delete">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
