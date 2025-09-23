import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import "../styles/Login.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: string }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const token = searchParams.get("token");
    if (!token) {
      setMessage({
        type: "error",
        text: "El enlace de restablecimiento no es válido o ha expirado.",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    try {
      const data = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      if (data.success) {
        setSuccess(true);
        setMessage({
          type: "success",
          text: "Contraseña restablecida correctamente.",
        });
      } else if (data.errors) {
        setMessage({ type: "error", text: data.errors.join(" ") });
      } else {
        setMessage({
          type: "error",
          text: data.message || "No se pudo restablecer la contraseña.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocurrió un error. Por favor, inténtalo nuevamente.",
      });
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Restablecer contraseña</h1>
      {success ? (
        <div className={`login-message success`}>
          {message ? message.text : "Contraseña restablecida correctamente."}
          <br />
          <a
            href="#"
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Iniciar sesión
          </a>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`login-message ${message.type}`}>
              {message.text}
            </div>
          )}
          <input
            type="password"
            name="password"
            placeholder="Nueva contraseña"
            className="login-input"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar nueva contraseña"
            className="login-input"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn">
            Restablecer contraseña
          </button>
        </form>
      )}
    </div>
  );
}
