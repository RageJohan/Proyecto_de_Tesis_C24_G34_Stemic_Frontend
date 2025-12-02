"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "./Header"
import { apiFetch, inscribirseEvento, cancelarInscripcionEvento, estadoInscripcionEvento, getMyEventPostulation } from "../services/api"
import "../styles/EventDetail.css" // Asegúrate de que este es el archivo actualizado
import { useAuth } from "../context/AuthContext"
import AttendanceScanner from "./AttendanceScanner" 
import EventPostulationModal from "./EventPostulationModal"

// Iconos SVG simples
const Icons = {
  Calendar: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Map: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Video: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Mail: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Info: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Qr: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z" /></svg>
}

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

  const [showScanner, setShowScanner] = useState(false);
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);

  // --- LOGICA (Sin cambios funcionales, solo visuales) ---
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
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
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

  // --- RENDERIZADO ---
  
  if (loading) return <><Header /><div className="center-message">Cargando evento...</div></>
  if (error) return <><Header /><div className="center-message" style={{color: '#ef4444'}}>{error}</div></>
  if (!event) return <><Header /><div className="center-message">No se encontró el evento.</div></>

  // Datos normalizados
  const image = event.imagen_url || event.image || "https://via.placeholder.com/600x400?text=Evento"
  const title = event.titulo || event.title || "Sin título"
  const desc = event.descripcion || event.description || ""
  const date = event.fecha_hora || event.date || event.fecha || ""
  const duration = event.duracion || event.duration || "No especificada"
  const modalidad = event.modalidad || "Presencial"
  const espacio = event.espacio || event.lugar || event.location || "Por definir"
  const requierePostulacion = event.requiere_postulacion || event.requierePostulacion || false
  const contacto = event.contacto || event.consultas || event.email || ""
  const tags = event.tags || event.etiquetas || []
  const skills = event.skills || []
  
  const isDatePast = date ? new Date(date) < new Date() : false;

  return (
    <div className="event-detail-wrapper">
      <Header />
      
      {/* Modal Scanner */}
      {showScanner && (
        <AttendanceScanner 
          onClose={() => setShowScanner(false)}
          onSuccess={(data) => {
            setAsistenciaRegistrada(true);
            setInscripcionMsg(data.message || "¡Asistencia registrada con éxito!");
            setShowScanner(false);
          }}
        />
      )}

      {/* 1. Hero Section */}
      <div className="event-hero">
        <div className="event-hero-bg" style={{ backgroundImage: `url(${image})` }}></div>
        <div className="event-hero-content">
          <img src={image} alt={title} className="event-hero-img" />
          <div className="event-hero-text">
            {date && (
              <div className="event-hero-date">
                <Icons.Calendar />
                {new Date(date).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            )}
            <h1>{title}</h1>
            <div className="tags-container">
              {tags.map((tag, i) => (
                <span key={i} className="chip tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Layout */}
      <div className="event-container">
        
        {/* Columna Izquierda: Contenido Principal */}
        <div className="event-main-content">
          <div className="info-card">
            <h3 className="section-title"><Icons.Info /> Descripción</h3>
            <div className="text-content">
              {desc}
            </div>
          </div>

          {(event.info_adicional || event.informacion_adicional) && (
            <div className="info-card">
              <h3 className="section-title">Información Adicional</h3>
              <div className="text-content">
                {event.info_adicional || event.informacion_adicional}
              </div>
            </div>
          )}

          {skills.length > 0 && (
             <div className="info-card">
               <h3 className="section-title">Habilidades que desarrollarás</h3>
               <div className="tags-container">
                 {skills.map((skill, i) => (
                   <span key={i} className="chip skill">{skill}</span>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Columna Derecha: Sidebar Sticky */}
        <div className="event-sidebar">
          <div className="sidebar-sticky">
            
            {/* Tarjeta de Detalles */}
            <div className="info-card details-list">
              <div className="detail-item">
                <div className="detail-icon"><Icons.Clock /></div>
                <div className="detail-text">
                   <label>Hora & Duración</label>
                   <span>
                     {date ? new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} 
                     {' • '}{duration}
                   </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon"><Icons.Video /></div>
                <div className="detail-text">
                   <label>Modalidad</label>
                   <span>{modalidad}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon"><Icons.Map /></div>
                <div className="detail-text">
                   <label>Ubicación</label>
                   <span>{espacio}</span>
                </div>
              </div>
              {contacto && (
                <div className="detail-item">
                  <div className="detail-icon"><Icons.Mail /></div>
                  <div className="detail-text">
                     <label>Contacto</label>
                     <span>{contacto}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta de Acciones */}
            <div className="action-card">
              {/* Mensajes de Estado */}
              {inscripcionMsg && (
                <div className={`status-message ${
                  inscripcionMsg.toLowerCase().includes("exitos") || inscripcionMsg.toLowerCase().includes("registrada") || inscripcionMsg.toLowerCase().includes("enviada")
                  ? "success" : "error"
                }`}>
                  {inscripcionMsg}
                </div>
              )}

              {/* Status Postulación */}
              {myPostulation && (
                 <div className="postulation-box">
                    <label style={{display:'block', fontSize:'0.8rem', color:'#94a3b8', marginBottom:'0.5rem'}}>Estado de postulación:</label>
                    <div style={{color: '#facc15', fontWeight: 'bold', textTransform: 'capitalize'}}>
                      {myPostulation.estado.replace(/_/g, " ")}
                    </div>
                    {myPostulation.comentarios_revision && (
                      <p style={{fontSize:'0.85rem', marginTop:'0.5rem', color: '#cbd5e1'}}>
                        "{myPostulation.comentarios_revision}"
                      </p>
                    )}
                 </div>
              )}

              {/* Lógica de Botones Principal */}
              {!isAuthenticated ? (
                <button className="btn-action btn-primary" onClick={() => navigate("/login")}>
                  Inicia sesión para participar
                </button>
              ) : (
                <>
                  {/* Botones para Eventos con Postulación */}
                  {requierePostulacion && (
                    <button 
                      className="btn-action btn-primary"
                      onClick={() => setShowPostulation(true)}
                      disabled={isDatePast}
                    >
                      {myPostulation ? "Ver mi postulación" : "Postularme ahora"}
                    </button>
                  )}

                  {/* Botones para Eventos Abiertos (Sin postulación) */}
                  {!requierePostulacion && (
                    inscrito ? (
                      <button 
                        className="btn-action btn-danger"
                        onClick={handleCancelarInscripcion}
                        disabled={inscribiendo || isDatePast}
                      >
                        {inscribiendo ? "Procesando..." : "Cancelar Inscripción"}
                      </button>
                    ) : (
                      <button 
                        className="btn-action btn-primary"
                        onClick={handleInscribirse}
                        disabled={inscribiendo || isDatePast}
                      >
                        {inscribiendo ? "Procesando..." : "Inscribirme al evento"}
                      </button>
                    )
                  )}

                  {/* Botón Escáner QR (Asistencia) */}
                  {/* Se muestra si estás inscrito (o postulación aprobada) y el evento es hoy/pasado */}
                  {(inscrito || (myPostulation && myPostulation.estado === 'aprobado')) && (
                    <button
                      className="btn-action btn-qr"
                      onClick={() => setShowScanner(true)}
                      disabled={asistenciaRegistrada}
                    >
                      <Icons.Qr />
                      {asistenciaRegistrada ? "Asistencia Verificada" : "Registrar Asistencia (QR)"}
                    </button>
                  )}
                </>
              )}
              
              <button className="btn-action btn-secondary" onClick={() => navigate(-1)}>
                Volver atrás
              </button>
            </div>

          </div>
        </div>
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
    </div>
  )
}