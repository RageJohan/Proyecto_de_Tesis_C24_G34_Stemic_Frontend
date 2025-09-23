import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import "../styles/Login.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [correo, setcorreo] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      setSent(true);
      setMessage({
        type: "success",
        text: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocurrió un error. Por favor, inténtalo nuevamente.",
      });
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Recuperar contraseña</h1>
      {sent ? (
        <div className={`login-message success`}>
          {message
            ? message.text
            : "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`login-message ${message.type}`}>
              {message.text}
            </div>
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            className="login-input"
            value={correo}
            onChange={(e) => setcorreo(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Enviar enlace
          </button>
        </form>
      )}
      <div className="login-register" style={{ marginTop: "1.5rem" }}>
        <a
          href="#"
          className="login-link"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Volver al login
        </a>
      </div>
    </div>
  );
}
