import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-title">STEMIC</div>
      <nav className="sidebar-nav">
        <NavLink to="/admin-alliances" activeClassName="active">Alianzas</NavLink>
        <NavLink to="/admin-events" activeClassName="active">Eventos</NavLink>
        <NavLink to="/admin-applications" activeClassName="active">Postulaciones</NavLink>
      </nav>
      <div style={{ marginTop: "auto", padding: "1.5rem" }}>
        <NavLink to="/" className="sidebar-back-btn">
          Volver a vista usuario
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
