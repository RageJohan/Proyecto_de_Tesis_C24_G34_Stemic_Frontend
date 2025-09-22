import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { loadGoogleScript, renderGoogleButton } from '../../services/googleOAuth';
import { useAuth } from '../../context/AuthContext';
import "../styles/Login.css";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    correo: "",
    password: "",
    confirmPassword: "",
    terms: false
  });
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
                setMessage({ type: 'success', text: '¡Registro con Google exitoso! Redirigiendo...' });
                login(data.data.token);
                setTimeout(() => navigate('/dashboard'), 2000);
              } else {
                setMessage({ type: 'error', text: data.message || 'Error desconocido en registro con Google.' });
              }
            } catch (error) {
              setMessage({ type: 'error', text: 'Error en registro con Google: ' + error.message });
            }
          }
        },
        'google-register-btn'
      );
    });
    return () => {
      // Limpia el contenedor al desmontar para evitar duplicados
      const btn = document.getElementById('google-register-btn');
      if (btn) btn.innerHTML = '';
    };
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    if (!form.terms) {
      setMessage({ type: 'error', text: 'Debes aceptar los términos y condiciones.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.name, correo: form.correo, password: form.password, confirmPassword: form.confirmPassword })
      });
      if (data?.data?.token) {
        setMessage({ type: 'success', text: '¡Registro exitoso! Redirigiendo...' });
        login(data.data.token);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else if (data.errors) {
        // Mostrar errores de validación de forma amigable
        setMessage({ type: 'error', text: data.errors.map(e => {
          if (e.toLowerCase().includes('correo')) return 'El correo ingresado no es válido o ya está en uso.';
          if (e.toLowerCase().includes('contraseña')) return 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.';
          if (e.toLowerCase().includes('nombre')) return 'El nombre debe tener al menos 2 caracteres.';
          return 'Por favor, revisa los datos ingresados.';
        }).join(' ') });
      } else if (data.message && (data.message.toLowerCase().includes('409') || data.message.toLowerCase().includes('error interno'))) {
        setMessage({ type: 'error', text: 'No se pudo completar el registro. Por favor, verifica tus datos o intenta con otro correo.' });
      } else {
        setMessage({ type: 'error', text: 'Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error en registro: ' + error.message });
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Crear cuenta</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        {message && (
          <div className={`login-message ${message.type}`}>{message.text}</div>
        )}
        <input
          type="text"
          name="name"
          placeholder="Nombres"
          className="login-input"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          className="login-input"
          value={form.correo}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="login-input"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          className="login-input"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.98rem', gap: '0.5rem', color: 'var(--color-texto-adicional)' }}>
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            style={{ accentColor: 'var(--color-principal)' }}
            required
          />
          Acepto los términos y condiciones
        </label>
        <button type="submit" className="login-btn">Registrarse</button>
        <div className="login-divider">o</div>
        <div id="google-register-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}></div>
        <div className="login-register">
          ¿Ya tienes cuenta? <a href="#" className="login-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}
