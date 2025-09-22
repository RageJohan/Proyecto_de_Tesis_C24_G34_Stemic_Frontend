import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo" onClick={() => navigate("/")}>STEMIC</span>
        <nav className="header-nav">
          <button className="header-link" onClick={() => navigate("/")}>Inicio</button>
          <button className="header-link" onClick={() => navigate("/eventos")}>Eventos</button>
          <button className="header-link" onClick={() => navigate("/organizaciones")}>Organizaciones</button>
          <button className="header-link" onClick={() => navigate("/unete")}>Únete</button>
          <button className="header-link" onClick={() => navigate("/about-us")}>Sobre Nosotros</button>
        </nav>
      </div>
      <div className="header-profile">
        <button className="header-profile-btn" onClick={() => setProfileOpen(v => !v)}>
          Mi perfil <span className="header-profile-caret">▼</span>
        </button>
        {profileOpen && (
          <div className="header-profile-dropdown">
            <button className="header-profile-item" onClick={onLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}
