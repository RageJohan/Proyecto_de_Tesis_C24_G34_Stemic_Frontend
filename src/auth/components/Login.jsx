import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import {
  loadGoogleScript,
  renderGoogleButton,
} from "../../services/googleOAuth";
import { useAuth } from "../../context/AuthContext";
import ErrorMessage from "./ErrorMessage";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [correo, setcorreo] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: string }
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGoogleScript().then(() => {
      renderGoogleButton(
        import.meta.env.VITE_GOOGLE_CLIENT_ID,
        async (response) => {
          if (response.credential) {
            setLoading(true);
            try {
              const data = await apiFetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential }),
              }, false);
              if (data?.data?.token) {
                setMessage(
                  "¡Inicio de sesión con Google exitoso! Redirigiendo..."
                );
                setMessageType("success");
                login(data.data.token);
                setTimeout(() => navigate("/dashboard"), 2000);
              } else {
                setMessage(
                  data.message || "Error desconocido en login con Google."
                );
                setMessageType("error");
              }
            } catch (error) {
              if (import.meta.env.DEV) console.error(error);
              setMessage("Error en login con Google: " + error.message);
              setMessageType("error");
            } finally {
              setLoading(false);
            }
          }
        },
        "google-signin-btn"
      );
    });
    return () => {
      // Limpia el contenedor al desmontar para evitar duplicados
      const btn = document.getElementById("google-signin-btn");
      if (btn) btn.innerHTML = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      }, false);
      if (data?.data?.token) {
        setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
        setMessageType("success");
        login(data.data.token);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (data.errors) {
        // Mostrar errores de validación de forma amigable
        const friendly = data.errors
          .map((e) => {
            if (e.toLowerCase().includes("correo"))
              return "El correo ingresado no es válido o la contraseña es incorrecta.";
            if (e.toLowerCase().includes("contraseña"))
              return "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.";
            return "Por favor, revisa los datos ingresados.";
          })
          .join(" ");
        setMessage(friendly);
        setMessageType("error");
      } else if (data.message) {
        // Analizar el mensaje del backend y evitar mostrar códigos técnicos
        const msg = data.message.toLowerCase();
        if (msg.includes("usuario") && msg.includes("no encontrado")) {
          setMessage("El usuario no existe. ¿Deseas registrarte?");
        } else if (msg.includes("contraseña")) {
          setMessage(
            "Contraseña incorrecta. Intenta nuevamente o restablécela."
          );
        } else if (
          msg.includes("401") ||
          msg.includes("error interno") ||
          msg.includes("unauthorized")
        ) {
          setMessage("Correo o contraseña incorrectos.");
        } else {
          setMessage(
            "Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente."
          );
        }
        setMessageType("error");
      } else {
        setMessage(
          "Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente."
        );
        setMessageType("error");
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      // Si el error contiene 401, mostrar mensaje amigable
      if (error.message && error.message.toLowerCase().includes("401")) {
        setMessage("Correo o contraseña incorrectos.");
      } else {
        setMessage(
          "No se pudo iniciar sesión. Por favor, verifica tus datos e inténtalo nuevamente."
        );
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">STEMIC</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <ErrorMessage
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="login-input"
          value={correo}
          onChange={(e) => setcorreo(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <div className="login-options">
          <a
            href="#"
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
        <div className="login-divider">o</div>
        <div
          id="google-signin-btn"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        ></div>
        <div className="login-register">
          ¿No tienes cuenta?{" "}
          <a
            href="#"
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            Regístrate ahora
          </a>
        </div>
        <button
          type="button"
          className="login-btn login-btn-home"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Ir a la página principal
        </button>
      </form>
    </div>
  );
}
