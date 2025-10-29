import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  // Añadir clase al body cuando el Header se monta
  useEffect(() => {
    document.body.classList.add('with-header');
    return () => {
      document.body.classList.remove('with-header');
    };
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { logout, isAuthenticated, user } = useAuth();

  const handleNav = (view) => {
    setNavOpen(false);
    if (view === "home") navigate("/");
    else if (view === "eventos") navigate("/events");
    else if (view === "organizaciones") navigate("/organizations");
    else if (view === "join-us") navigate("/join-us");
    else if (view === "sobre") navigate("/about-us");
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo" onClick={() => handleNav("home")}>
          STEMIC
        </span>
        {isMobile ? (
          <>
            <button
              className="header-hamburger"
              aria-label="Abrir menú"
              onClick={() => setNavOpen((v) => !v)}
            >
              <span role="img" aria-label="menu">
                ☰
              </span>
            </button>
            <nav
              className={`header-nav${navOpen ? " open" : ""}`}
              style={{ display: navOpen ? "flex" : "none" }}
            >
              <button className="header-link" onClick={() => handleNav("home")}>
                Inicio
              </button>
              <button
                className="header-link"
                onClick={() => handleNav("eventos")}
              >
                Eventos
              </button>
              <button
                className="header-link"
                onClick={() => handleNav("organizaciones")}
              >
                Organizaciones
              </button>
              <button
                className="header-link"
                onClick={() => handleNav("join-us")}
              >
                Únete
              </button>
              <button
                className="header-link"
                onClick={() => handleNav("sobre")}
              >
                Sobre Nosotros
              </button>
            </nav>
          </>
        ) : (
          <nav className="header-nav" style={{ display: "flex" }}>
            <button className="header-link" onClick={() => handleNav("home")}>
              Inicio
            </button>
            <button
              className="header-link"
              onClick={() => handleNav("eventos")}
            >
              Eventos
            </button>
            <button
              className="header-link"
              onClick={() => handleNav("organizaciones")}
            >
              Organizaciones
            </button>
            <button
              className="header-link"
              onClick={() => handleNav("join-us")}
            >
              Únete
            </button>
            <button className="header-link" onClick={() => handleNav("sobre")}>
              Sobre Nosotros
            </button>
          </nav>
        )}
      </div>
      <div className="header-profile">
        {isAuthenticated ? (
          <>
            <button
              className="header-profile-btn"
              onClick={() => setProfileOpen((v) => !v)}
            >
              Mi perfil <span className="header-profile-caret">▼</span>
            </button>
            {profileOpen && (
              <div className="header-profile-dropdown">
                {/* Enlace para Admin */}
                {user?.rol === "admin" && (
                  <button
                    className="header-profile-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin-events");
                    }}
                  >
                    Admin Panel
                  </button>
                )}

                {/* --- INICIO DE MODIFICACIÓN --- */}
                {/* Enlace para Organizador */}
                {user?.rol === "organizador" && (
                  <button
                    className="header-profile-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/organizer-dashboard"); // Ruta al nuevo dashboard
                    }}
                  >
                    Panel de Organizador
                  </button>
                )}
                {/* --- FIN DE MODIFICACIÓN --- */}

                <button
                  className="header-profile-item"
                  onClick={() => {
                      setProfileOpen(false); // Cierra el dropdown
                      navigate("/participations");
                  }}
                >
                  Participaciones
                </button>
                <button
                  className="header-profile-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  Actualizar mi perfil
                </button>
                <button
                  className="header-profile-item"
                  onClick={async () => {
                    setProfileOpen(false); // Cierra el dropdown
                    if (onLogout) {
                      await onLogout();
                    } else {
                      logout();
                      navigate("/login");
                    }
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="header-link" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
            <button
              className="header-link"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    </header>
  );
}