import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { loadGoogleScript, renderGoogleButton } from '../../services/googleOAuth';
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setcorreo] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: string }

  useEffect(() => {
    loadGoogleScript().then(() => {
      renderGoogleButton(
        import.meta.env.VITE_GOOGLE_CLIENT_ID,
        async (response) => {
          if (response.credential) {
            try {
              const data = await apiFetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
              });
              if (data?.data?.token) {
                setMessage({ type: 'success', text: '¡Inicio de sesión con Google exitoso! Redirigiendo...' });
                localStorage.setItem('token', data.data.token);
                setTimeout(() => navigate('/dashboard'), 2000);
              } else {
                setMessage({ type: 'error', text: data.message || 'Error desconocido en login con Google.' });
              }
            } catch (error) {
              setMessage({ type: 'error', text: 'Error en login con Google: ' + error.message });
            }
          }
        },
        'google-signin-btn'
      );
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      if (data?.data?.token) {
        setMessage({ type: 'success', text: '¡Inicio de sesión exitoso! Redirigiendo...' });
        localStorage.setItem('token', data.data.token);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else if (data.errors) {
        // Mostrar errores de validación de forma amigable
        setMessage({ type: 'error', text: data.errors.map(e => {
          if (e.toLowerCase().includes('correo')) return 'El correo ingresado no es válido o la contraseña es incorrecta.';
          if (e.toLowerCase().includes('contraseña')) return 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.';
          return 'Por favor, revisa los datos ingresados.';
        }).join(' ') });
      } else if (data.message && (data.message.toLowerCase().includes('401') || data.message.toLowerCase().includes('error interno'))) {
        setMessage({ type: 'error', text: 'Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente.' });
      } else {
        setMessage({ type: 'error', text: 'Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de autenticación: ' + error.message });
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">STEMIC</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        {message && (
          <div className={`login-message ${message.type}`}>{message.text}</div>
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          className="login-input"
          value={correo}
          onChange={e => setcorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div className="login-options">
          <a
            href="#"
            className="login-link"
            onClick={e => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <button type="submit" className="login-btn">Iniciar sesión</button>
        <div className="login-divider">o</div>
        <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}></div>
        <div className="login-register">
          ¿No tienes cuenta? <a href="#" className="login-link" onClick={e => { e.preventDefault(); navigate('/register'); }}>Regístrate ahora</a>
        </div>
      </form>
    </div>
  );
}
