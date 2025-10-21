import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/AdminSidebar.css";

const AdminSidebar = ({ children }) => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-title">STEMIC</div>
        <nav className="sidebar-nav">
          <NavLink to="/admin-alliances" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-handshake"></i>
            Alianzas
          </NavLink>
          <NavLink to="/admin-events" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-calendar-alt"></i>
            Eventos
          </NavLink>
          <NavLink to="/admin-applications" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-file-alt"></i>
            Postulaciones
          </NavLink>
        </nav>
        <div style={{ marginTop: "auto", marginBottom: "2rem" }}>
          <NavLink to="/" className="sidebar-back-btn">
            <i className="fas fa-arrow-left"></i>
            Volver a vista usuario
          </NavLink>
        </div>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminSidebar;
