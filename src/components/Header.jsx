import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

export default function Header({ onLogout, onProfileUpdate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNav = (view) => {
    setNavOpen(false);
    if (view === 'home') navigate("/");
    else if (view === 'eventos') navigate("/events");
    else if (view === 'organizaciones') navigate("/organizaciones");
    else if (view === 'join-us') navigate("/join-us");
    else if (view === 'sobre') navigate("/about-us");
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo" onClick={() => handleNav('home')}>STEMIC</span>
        {isMobile ? (
          <>
            <button className="header-hamburger" aria-label="Abrir menú" onClick={() => setNavOpen(v => !v)}>
              <span role="img" aria-label="menu">☰</span>
            </button>
            <nav className={`header-nav${navOpen ? ' open' : ''}`} style={{ display: navOpen ? 'flex' : 'none' }}>
              <button className="header-link" onClick={() => handleNav('home')}>Inicio</button>
              <button className="header-link" onClick={() => handleNav('eventos')}>Eventos</button>
              <button className="header-link" onClick={() => handleNav('organizaciones')}>Organizaciones</button>
              <button className="header-link" onClick={() => handleNav('join-us')}>Únete</button>
              <button className="header-link" onClick={() => handleNav('sobre')}>Sobre Nosotros</button>
            </nav>
          </>
        ) : (
          <nav className="header-nav" style={{ display: 'flex' }}>
            <button className="header-link" onClick={() => handleNav('home')}>Inicio</button>
            <button className="header-link" onClick={() => handleNav('eventos')}>Eventos</button>
            <button className="header-link" onClick={() => handleNav('organizaciones')}>Organizaciones</button>
            <button className="header-link" onClick={() => handleNav('join-us')}>Únete</button>
            <button className="header-link" onClick={() => handleNav('sobre')}>Sobre Nosotros</button>
          </nav>
        )}
      </div>
      <div className="header-profile">
        <button className="header-profile-btn" onClick={() => setProfileOpen(v => !v)}>
          Mi perfil <span className="header-profile-caret">▼</span>
        </button>
        {profileOpen && (
          <div className="header-profile-dropdown">
            <button className="header-profile-item" onClick={() => navigate('/participations')}>Participaciones</button>
            <button className="header-profile-item" onClick={onProfileUpdate}>Actualizar mi perfil</button>
            <button className="header-profile-item" onClick={onLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}

