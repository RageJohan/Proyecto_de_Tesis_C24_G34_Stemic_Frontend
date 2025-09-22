import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

export default function Header({ onLogout, onProfileUpdate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (view) => {
    if (view === 'home') navigate("/");
    if (view === 'eventos') navigate("/eventos");
    if (view === 'organizaciones') navigate("/organizaciones");
    if (view === 'unete') navigate("/unete");
    if (view === 'sobre') navigate("/about-us");
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo" onClick={() => handleNav('home')}>STEMIC</span>
        <nav className="header-nav">
          <button className="header-link" onClick={() => handleNav('home')}>Inicio</button>
          <button className="header-link" onClick={() => handleNav('eventos')}>Eventos</button>
          <button className="header-link" onClick={() => handleNav('organizaciones')}>Organizaciones</button>
          <button className="header-link" onClick={() => handleNav('unete')}>Únete</button>
          <button className="header-link" onClick={() => handleNav('sobre')}>Sobre Nosotros</button>
        </nav>
      </div>
      <div className="header-profile">
        <button className="header-profile-btn" onClick={() => setProfileOpen(v => !v)}>
          Mi perfil <span className="header-profile-caret">▼</span>
        </button>
        {profileOpen && (
          <div className="header-profile-dropdown">
            <button className="header-profile-item" onClick={onProfileUpdate}>Actualizar mi perfil</button>
            <button className="header-profile-item" onClick={onLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}
