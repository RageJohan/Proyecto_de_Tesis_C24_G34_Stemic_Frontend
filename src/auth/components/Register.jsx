





import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { loadGoogleScript, renderGoogleButton } from '../../services/googleOAuth';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from "./ErrorMessage";
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
  const [message, setMessage] = useState(null); // string
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGoogleScript().then(() => {
      renderGoogleButton(
        import.meta.env.VITE_GOOGLE_CLIENT_ID,
        async (response) => {
          if (response.credential) {
            setLoading(true);
            try {
              const data = await apiFetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
              });
              if (data?.data?.token) {
                setMessage('¡Registro con Google exitoso! Redirigiendo...');
                setMessageType('success');
                login(data.data.token);
                setTimeout(() => navigate('/dashboard'), 2000);
              } else {
                setMessage(data.message || 'Error desconocido en registro con Google.');
                setMessageType('error');
              }
            } catch (error) {
              if (import.meta.env.DEV) console.error(error);
              setMessage('Error en registro con Google: ' + error.message);
              setMessageType('error');
            } finally {
              setLoading(false);
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
    setLoading(true);
    if (!form.terms) {
      setMessage('Debes aceptar los términos y condiciones.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.name, correo: form.correo, password: form.password, confirmPassword: form.confirmPassword })
      });
      if (data?.data?.token) {
        setMessage('¡Registro exitoso! Redirigiendo...');
        setMessageType('success');
        login(data.data.token);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else if (data.errors) {
        // Mostrar errores de validación de forma amigable
        const friendly = data.errors.map(e => {
          const err = e.toLowerCase();
          if (err.includes('correo')) return 'El correo ingresado no es válido o ya está en uso.';
          if (err.includes('contraseña')) return 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.';
          if (err.includes('nombre')) return 'El nombre debe tener al menos 2 caracteres.';
          return 'Por favor, revisa los datos ingresados.';
        }).join(' ');
        setMessage(friendly);
        setMessageType('error');
      } else if (data.message) {
        // Analizar el mensaje del backend y evitar mostrar códigos técnicos
        const msg = data.message.toLowerCase();
        if (msg.includes('correo') && (msg.includes('existe') || msg.includes('usado') || msg.includes('409'))) {
          setMessage('El correo ya está registrado. ¿Quieres iniciar sesión?');
        } else if (msg.includes('409') || msg.includes('error interno')) {
          setMessage('No se pudo completar el registro. Por favor, verifica tus datos o intenta con otro correo.');
        } else {
          setMessage('Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente.');
        }
        setMessageType('error');
      } else {
        setMessage('Ocurrió un error. Por favor, verifica tus datos e inténtalo nuevamente.');
        setMessageType('error');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      // Si el error contiene 409, mostrar mensaje amigable
      if (error.message && error.message.toLowerCase().includes('409')) {
        setMessage('El correo ya está registrado. ¿Quieres iniciar sesión?');
      } else {
        setMessage('No se pudo completar el registro. Por favor, verifica tus datos e inténtalo nuevamente.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Crear cuenta</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <ErrorMessage message={message} type={messageType} onClose={() => setMessage(null)} />
        <input
          type="text"
          name="name"
          placeholder="Nombres"
          className="login-input"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          className="login-input"
          value={form.correo}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="login-input"
          value={form.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          className="login-input"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.98rem', gap: '0.5rem', color: 'var(--color-texto-adicional)' }}>
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            style={{ accentColor: 'var(--color-principal)' }}
            required
            disabled={loading}
          />
          Acepto los términos y condiciones
        </label>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
        <div className="login-divider">o</div>
        <div id="google-register-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}></div>
        <div className="login-register">
          ¿Ya tienes cuenta? <a href="#" className="login-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}
