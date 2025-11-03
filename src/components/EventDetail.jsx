/**
 * @file src/components/EventDetail.jsx
 * @description Vista de detalle para un evento, mostrando información
 * y permitiendo la inscripción, cancelación y registro de asistencia por QR.
 * @author Tu Nombre
 * @requires react
 * @requires react-router-dom
 * @requires ../services/api
 * @requires ../context/AuthContext
 * @requires ./Header
 * @requires ./AttendanceScanner
 * @requires ../styles/EventDetail.css
 */

"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "./Header"
// Importamos la nueva función de api
import { apiFetch, inscribirseEvento, cancelarInscripcionEvento, estadoInscripcionEvento, getMyEventPostulation } from "../services/api"
import "../styles/EventDetail.css"
import { useAuth } from "../context/AuthContext"
// Importamos el nuevo componente de escáner
import AttendanceScanner from "./AttendanceScanner" 
import EventPostulationModal from "./EventPostulationModal"

export default function EventDetail() {
  const { isAuthenticated } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [inscripcionMsg, setInscripcionMsg] = useState("")
  const [inscrito, setInscrito] = useState(false)
  const [showPostulation, setShowPostulation] = useState(false)
  const [myPostulation, setMyPostulation] = useState(null)

  // --- NUEVOS ESTADOS ---
  /** Estado para mostrar/ocultar el modal del escáner QR */
  const [showScanner, setShowScanner] = useState(false);
  /** Estado para saber si el usuario ya marcó asistencia */
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);
  // ---------------------

  const handleInscribirse = async () => {
    setInscribiendo(true)
    setInscripcionMsg("")
    try {
      await inscribirseEvento(id)
      setInscripcionMsg("¡Inscripción exitosa!")
      setInscrito(true)
    } catch (e) {
      setInscripcionMsg(e.message || "Error al inscribirse")
    } finally {
      setInscribiendo(false)
    }
  }

  const handleCancelarInscripcion = async () => {
    setInscribiendo(true)
    setInscripcionMsg("")
    try {
      await cancelarInscripcionEvento(id)
      setInscripcionMsg("Inscripción cancelada")
      setInscrito(false)
    } catch (e) {
      setInscripcionMsg(e.message || "Error al cancelar inscripción")
    } finally {
      setInscribiendo(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const eventResponse = await apiFetch(`/api/events/public/${id}`)
        if (!isMounted) return

        const eventData = eventResponse.data || eventResponse.event || eventResponse
        setEvent(eventData)

        if (isAuthenticated) {
          const [isInscribed, submission] = await Promise.all([
            estadoInscripcionEvento(id).catch(() => false),
            (eventData.requiere_postulacion || eventData.requierePostulacion)
              ? getMyEventPostulation(id).catch(() => null)
              : Promise.resolve(null)
          ])

          if (!isMounted) return
          setInscrito(Boolean(isInscribed))
          setMyPostulation(submission)
        } else {
          setInscrito(false)
          setMyPostulation(null)
        }
      } catch (err) {
        if (!isMounted) return
        setError("No se pudo cargar el evento")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [id, isAuthenticated])

  const refreshMyPostulation = async () => {
    if (!isAuthenticated) return
    try {
      const submission = await getMyEventPostulation(id)
      setMyPostulation(submission)
      setInscripcionMsg("Postulación enviada correctamente")
    } catch {
      setMyPostulation(null)
    }
  }

  if (loading)
    return (
      <>
        <Header />
        <div className="loading-state">Cargando evento...</div>
      </>
    )

  if (error)
    return (
      <>
        <Header />
        <div className="error-state">{error}</div>
      </>
    )

  if (!event)
    return (
      <>
        <Header />
        <div className="error-state">No se encontró el evento.</div>
      </>
    )

  // Compatibilidad de campos
  const image = event.imagen_url || event.image || "https://via.placeholder.com/600x400?text=Evento"
  const title = event.titulo || event.title || "Sin título"
  const desc = event.descripcion || event.description || ""
  const date = event.fecha_hora || event.date || event.fecha || ""
  const duration = event.duracion || event.duration || ""
  const modalidad = event.modalidad || ""
  const espacio = event.espacio || event.lugar || event.location || ""
  const requierePostulacion = event.requiere_postulacion || event.requierePostulacion || false
  const contacto = event.contacto || event.consultas || event.email || ""
  const tags = event.tags || event.etiquetas || []
  const skills = event.skills || []

  return (
    <>
      <Header />

      {/* --- RENDERIZADO CONDICIONAL DEL MODAL --- */}
      {showScanner && (
        <AttendanceScanner 
          onClose={() => setShowScanner(false)}
          onSuccess={(data) => {
            // Callback al verificar asistencia con éxito
            setAsistenciaRegistrada(true);
            setInscripcionMsg(data.message || "¡Asistencia registrada con éxito!");
            setShowScanner(false); // Cierra el modal
          }}
        />
      )}
      {/* ------------------------------------------ */}

      <div className="event-detail-view">
        <div className="event-detail-main-box">
          <div className="event-detail-img-box">
            <img src={image || "/placeholder.svg"} alt={title} className="event-detail-img" />
            {date && (
              <div className="event-detail-img-box-date">
                {new Date(date).toLocaleString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
          <div className="event-detail-info-box">
            <h1 className="event-detail-title">{title}</h1>
            <p className="event-detail-desc">{desc}</p>
            <div className="event-detail-table">
              <div className="event-detail-table-row">
                <span className="event-detail-table-label">Duración:</span>
                <span className="event-detail-table-value">{duration || "No especificado"}</span>
              </div>
              <div className="event-detail-table-row">
                <span className="event-detail-table-label">Modalidad:</span>
                <span className="event-detail-table-value">{modalidad || "No especificado"}</span>
              </div>
              <div className="event-detail-table-row">
                <span className="event-detail-table-label">Espacio:</span>
                <span className="event-detail-table-value">{espacio || "No especificado"}</span>
              </div>
              <div className="event-detail-table-row">
                <span className="event-detail-table-label">Requiere postulación:</span>
                <span
                  className="event-detail-table-value"
                  style={{ color: requierePostulacion ? "#ff5252" : "#00e676" }}
                >
                  {requierePostulacion ? "Sí" : "No"}
                </span>
              </div>
              <div className="event-detail-table-row">
                <span className="event-detail-table-label">Consultas:</span>
                <span className="event-detail-table-value">{contacto || "No especificado"}</span>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="event-detail-tags">
                {tags.map((tag, i) => (
                  <span className="event-detail-tag" key={i}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="event-detail-section">
          <h3 className="event-detail-section-title">Información Adicional</h3>
          <p className="event-detail-section-content">{event.info_adicional || event.informacion_adicional || desc}</p>
        </div>

        <div className="event-detail-section">
          <h3 className="event-detail-section-title">Skills del evento</h3>
          <div className="event-detail-skills">
            {skills.length > 0 ? (
              skills.map((skill, i) => (
                <span className="event-detail-skill" key={i}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>No especificado</span>
            )}
          </div>
        </div>

        {/* --- GRUPO DE BOTONES MODIFICADO --- */}
        <div className="button-group">
          {!requierePostulacion &&
            (isAuthenticated ? (
              inscrito ? (
                <button
                  className="event-detail-back btn-cancelar"
                  onClick={handleCancelarInscripcion}
                  disabled={inscribiendo}
                >
                  {inscribiendo ? "Cancelando..." : "Cancelar Inscripción"}
                </button>
              ) : (
                <button
                  className="event-detail-back btn-inscribirse"
                  onClick={handleInscribirse}
                  disabled={inscribiendo}
                >
                  {inscribiendo ? "Inscribiendo..." : "Inscribirse"}
                </button>
              )
            ) : (
              <button className="event-detail-back btn-login" onClick={() => navigate("/login")}>
                Inicia sesión para inscribirte
              </button>
            ))}

          {requierePostulacion && (
            isAuthenticated ? (
              <button
                className="event-detail-back btn-inscribirse"
                onClick={() => setShowPostulation(true)}
              >
                {myPostulation ? "Ver mi postulación" : "Postularme"}
              </button>
            ) : (
              <button className="event-detail-back btn-login" onClick={() => navigate("/login")}>
                Inicia sesión para postularte
              </button>
            )
          )}

          {/* Botón de Escanear QR:
              - Solo aparece si estás autenticado.
              - Llama a setShowScanner(true) al hacer clic.
              - Se deshabilita y cambia de color/texto si la asistencia ya fue registrada.
          */}
          {isAuthenticated && (
            <button
              className="event-detail-back btn-scan-qr" // Nueva clase para estilos
              onClick={() => setShowScanner(true)}
              disabled={asistenciaRegistrada}
            >
              {asistenciaRegistrada ? "Asistencia Registrada" : "Escanear QR Asistencia"}
            </button>
          )}
          
          <button className="event-detail-back" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
        {/* ------------------------------------- */}

        {/* --- MENSAJE DE ESTADO MODIFICADO --- */}
        {inscripcionMsg && (
          <div className={`inscripcion-msg ${
            // Acepta "exitosa" O "registrada" como éxito
            inscripcionMsg.includes("exitosa") ||
            inscripcionMsg.includes("registrada") ||
            inscripcionMsg.includes("Postulación enviada")
              ? "success" 
              : "error"
          }`}>
            {inscripcionMsg}
          </div>
        )}
        {/* ----------------------------------- */}

        {myPostulation && (
          <div className="event-detail-section">
            <h3 className="event-detail-section-title">Estado de mi postulación</h3>
            <div className="event-detail-postulation-status">
              <span className={`postulation-badge postulation-badge--${myPostulation.estado}`}>
                {myPostulation.estado.replace(/_/g, " ")}
              </span>
              {myPostulation.comentarios_revision && (
                <p className="postulation-note">{myPostulation.comentarios_revision}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <EventPostulationModal
        eventId={id}
        open={showPostulation}
        onClose={() => setShowPostulation(false)}
        onSubmitted={() => {
          setShowPostulation(false)
          refreshMyPostulation()
        }}
      />
    </>
  )
}