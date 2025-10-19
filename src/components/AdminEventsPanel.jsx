
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import "../styles/AdminEventsPanel.css";
import { getEvents } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getEvents()
      .then((data) => setEvents(data))
      .catch(() => setError("No se pudieron cargar los eventos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ minWidth: 220 }}>
        <AdminSidebar />
      </div>
      <div className="admin-events-container fade-in-uniform" style={{ marginLeft: 220, flex: 1 }}>
        <h1 className="admin-events-title">Event Administration Panel</h1>
        <button className="admin-events-btn create" onClick={() => navigate("/admin-events/create") } style={{marginBottom:16}}>+ Create event</button>
        {loading ? (
          <div className="orgs-loading">Loading events...</div>
        ) : error ? (
          <div className="orgs-error">{error}</div>
        ) : events.length === 0 ? (
          <div className="orgs-empty">No events registered.</div>
        ) : (
          <table className="admin-events-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Description</th>
                <th>Actions</th>
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
                      <button className="admin-events-btn edit" onClick={() => navigate(`/admin-events/edit/${ev.id}`)}>Edit</button>
                      <button className="admin-events-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
