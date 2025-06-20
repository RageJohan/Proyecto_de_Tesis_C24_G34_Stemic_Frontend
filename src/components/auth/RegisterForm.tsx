"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { validateRegisterForm } from "@/utils/validation"
import { ROUTES } from "@/config/constants"
import type { RegisterData } from "@/types"

// Extender la interfaz para incluir el campo de términos
interface ExtendedRegisterData extends RegisterData {
  acceptTerms: boolean
}

const RegisterForm: React.FC = () => {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<ExtendedRegisterData>()

  const password = watch("password")

  const onSubmit = async (data: ExtendedRegisterData) => {
    try {
      // Validación del lado cliente (usando los datos básicos para el backend)
      const basicData: RegisterData = {
        nombre: data.nombre,
        correo: data.correo,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }

      const validation = validateRegisterForm(basicData)

      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setError(field as keyof ExtendedRegisterData, { message })
        })
        return
      }

      await registerUser(basicData)
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      console.error("Error al registrar:", error)
    }
  }

  // Google Sign-In
  useEffect(() => {
    // @ts-ignore
    if (window.google && document.getElementById("google-signin-btn-register")) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            await loginWithGoogle(response.credential)
            navigate(ROUTES.DASHBOARD)
          } catch (error) {
            alert("Error al registrarse con Google")
          }
        },
      })
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn-register"),
        { theme: "outline", size: "large", width: "100%" }
      )
    }
  }, [loginWithGoogle, navigate])

  return (
    <div className="auth-layout">
      {/* Lado izquierdo - Ilustración */}
      <div className="auth-illustration auth-illustration-register">
        <div className="register-illustration-content">
          <div className="login-illustration-img">
            <img
              src="/assets/register-illustration.png"
              alt="Networking Illustration"
            />
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          {/* Contenido principal */}
          <div className="auth-main-content">
            <h1 className="auth-title-main">
              <span className="stem-color">STEM</span><span className="ic-color">IC</span>
            </h1>

            <form className="auth-form-register space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">Nombres</label>
                <input
                  {...register("nombre", { required: "El nombre es obligatorio" })}
                  type="text"
                  id="nombre"
                  autoComplete="name"
                  className={`form-input ${errors.nombre ? "error" : ""}`}
                  placeholder="Larry Marcel"
                />
                {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
              </div>

              {/* Correo */}
              <div className="form-group">
                <label htmlFor="correo" className="form-label">Correo</label>
                <input
                  {...register("correo", { required: "El correo es obligatorio" })}
                  type="email"
                  id="correo"
                  autoComplete="email"
                  className={`form-input ${errors.correo ? "error" : ""}`}
                  placeholder="tucorreo@hotmail.com"
                />
                {errors.correo && <p className="form-error">{errors.correo.message}</p>}
              </div>

              {/* Contraseña */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  {...register("password", { required: "La contraseña es obligatoria" })}
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="at least 8 characters"
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirma Contraseña</label>
                <input
                  {...register("confirmPassword", {
                    required: "Debes confirmar la contraseña",
                    validate: (value) => value === password || "Las contraseñas no coinciden",
                  })}
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="at least 8 characters"
                />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>

              {/* Términos */}
              <div className="terms-checkbox">
                <input
                  {...register("acceptTerms", {
                    required: "Debes aceptar los términos y condiciones",
                  })}
                  type="checkbox"
                  id="acceptTerms"
                  className="terms-input"
                />
                <label htmlFor="acceptTerms" className="terms-label">
                  <span className="auth-link">Acepto los Términos y Condiciones de Servicio</span>
                </label>
              </div>
              {errors.acceptTerms && <p className="form-error">{errors.acceptTerms.message}</p>}

              {/* Botón crear */}
              <button type="submit" disabled={isLoading} className="btn btn-primary">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  "Crear Cuenta"
                )}
              </button>

              {/* Google */}
              <div>
                <div className="divider">
                  <p className="divider-text">O regístrate con</p>
                </div>
                <div id="google-signin-btn-register" style={{ width: "100%" }}></div>
              </div>
            </form>
          </div>

          {/* Pie de página */}
          <div className="auth-footer">
            <div className="auth-bottom-text">
              <p>
                ¿Ya tienes una cuenta?{" "}
                <Link to={ROUTES.LOGIN} className="auth-link font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
            <div className="auth-copyright">© 2025 ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm