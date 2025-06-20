import React, {  } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { validateLoginForm } from '@/utils/validation';
import { ROUTES } from '@/config/constants';
import type { LoginData } from '@/types';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      // Validación del lado cliente
      const validation = validateLoginForm(data);
      
      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setError(field as keyof LoginData, { message });
        });
        return;
      }

      await login(data);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

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
              <button
                type="button"
                className="btn btn-google"
                onClick={() => {
                  console.log('Google OAuth pendiente');
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /> </svg>
                Continuar con Google
              </button>
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