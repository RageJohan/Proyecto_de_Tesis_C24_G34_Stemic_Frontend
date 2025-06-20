import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { validateLoginForm } from '@/utils/validation';
import { ROUTES } from '@/config/constants';
import type { LoginData } from '@/types';

const LoginForm: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      // Validación del lado cliente
      const validation = validateLoginForm(data);

      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setError(field as keyof LoginData, { message });
        });
        setIsLoading(false);
        return;
      }

      await login(data);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setIsLoading(false);
    }
  };

  // Google Sign-In
  useEffect(() => {
    // @ts-ignore
    if (window.google && document.getElementById("google-signin-btn")) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            setIsLoading(true);
            await loginWithGoogle(response.credential);
            navigate(ROUTES.DASHBOARD);
          } catch (error) {
            alert("Error al iniciar sesión con Google");
            setIsLoading(false);
          }
        },
      });
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div className="auth-layout">
      {/* Left side - Illustration */}
      <div className="auth-illustration">
        <div className="auth-illustration-content">
          <img
            src="/assets/login-illustration.png"
            alt="STEM Illustration"
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          {/* Contenido principal */}
          <div className="auth-main-content">
            <h1 className="auth-title-main">
              <span className="stem-color">STEM</span><span className="ic-color">IC</span>
            </h1>

            <form className="auth-form-login space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Campo Email */}
              <div className="form-group">
                <label htmlFor="correo" className="form-label">
                  Correo
                </label>
                <input
                  {...register('correo', { required: 'El correo es obligatorio' })}
                  type="email"
                  id="correo"
                  autoComplete="email"
                  className={`form-input ${errors.correo ? 'error' : ''}`}
                  placeholder="tucorreo@hotmail.com"
                />
                {errors.correo && (
                  <p className="form-error">{errors.correo.message}</p>
                )}
              </div>

              {/* Campo Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="at least 8 characters"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
                <div className="forgot-password">
                  <button type="button" className="auth-link text-sm">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              {/* Separador y Google */}
              <div>
                <div className="divider">
                  <p className="divider-text">O continúa con</p>
                </div>
                <div id="google-signin-btn" style={{ width: "100%" }}></div>
              </div>
            </form>
          </div>

          {/* Pie de página */}
          <div className="auth-footer">
            <div className="auth-bottom-text">
              <p>
                ¿No tienes una cuenta?{" "}
                <Link to={ROUTES.REGISTER} className="auth-link font-medium">
                  Regístrate ahora
                </Link>
              </p>
            </div>
            <div className="auth-copyright">© 2025 ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;