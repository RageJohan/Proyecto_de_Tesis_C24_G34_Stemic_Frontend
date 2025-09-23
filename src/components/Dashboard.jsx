import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (e) {
      // No mostrar error técnico al usuario
    }
    logout();
    navigate("/login");
  };

  const handleNavigate = (view) => {
    if (view === "home") navigate("/");
    else navigate("/" + view);
  };

  return (
    <>
      <Header onNavigate={handleNavigate} onLogout={handleLogout} />
      <div
        style={{
          flex: 1,
          minHeight: "calc(100vh - 80px)", // solo header
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1 }}>
          <div
            style={{
              background: "#f8f9fa",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#28a745", marginBottom: "1rem" }}>
              ¡Bienvenido al Sistema STEMIC!
            </h2>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              Has iniciado sesión correctamente. El sistema está funcionando con
              React Router.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
