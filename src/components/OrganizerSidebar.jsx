import React from "react";
import { NavLink } from "react-router-dom";
// Reutiliza los estilos existentes del AdminSidebar
import "../styles/AdminSidebar.css"; 

const OrganizerSidebar = ({ children }) => {
  return (
    <div className="admin-layout"> {/* Reutiliza clase base */}
      <aside className="admin-sidebar"> {/* Reutiliza clase base */}
        <div className="sidebar-title">PANEL ORGANIZADOR</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/organizer-dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-chart-line"></i>
            Dashboard
          </NavLink>
          <NavLink
            to="/event-dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-chart-area"></i>
            Dashboard Evento
          </NavLink>
          <NavLink
            to="/organizer-events"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-calendar-alt"></i>
            Mis Eventos
          </NavLink>
          <NavLink
            to="/organizer-reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-file-alt"></i>
            Reportes
          </NavLink>
        </nav>
        <div style={{ marginTop: "auto", marginBottom: "2rem" }}>
          <NavLink to="/" className="sidebar-back-btn">
            <i className="fas fa-arrow-left"></i>
            Volver a vista usuario
          </NavLink>
        </div>
      </aside>
      <main className="admin-content"> {/* Reutiliza clase base */}
        {children}
      </main>
    </div>
  );
};

export default OrganizerSidebar;