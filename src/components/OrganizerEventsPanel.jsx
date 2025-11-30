import React, { useEffect, useState } from "react";
import OrganizerSidebar from "./OrganizerSidebar";
// IMPORTANTE: Agregamos getActiveAttendanceQR a los imports
import { getEvents, getMyEventsForOrganizer, generateAttendanceQR, deleteEvent, getActiveAttendanceQR } from "../services/api";
import AttendanceQR from "./AttendanceQR";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../context/LoaderContext";
// Reutiliza estilos existentes
import "../styles/AdminEventsPanel.css";
import "../styles/AttendanceQR.css";

export default function OrganizerEventsPanel() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { withLoader, isLoading } = useLoader();

  // Estados para Modal QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRData, setCurrentQRData] = useState(null);
  const [qrError, setQrError] = useState("");
  const qrLoading = isLoading('qrGeneration'); // Loader específico para el QR
  const pageLoading = isLoading(); // Loader general de la página
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    fetchEvents(showAllEvents);
  }, [showAllEvents]);

  const fetchEvents = (allEvents) => {
    const fetchFunction = allEvents ? getEvents : getMyEventsForOrganizer;
    withLoader(fetchFunction, { message: allEvents ? 'Cargando todos los eventos...' : 'Cargando tus eventos...' })
      .then((data) => {
        const eventsArray = data?.data || (Array.isArray(data) ? data : []);
        setEvents(eventsArray);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "No se pudieron cargar los eventos");
      });
  };

  /**
   * Maneja la generación y visualización del código QR.
   * Lógica mejorada:
   * 1. Intenta buscar un QR activo existente.
   * 2. Si existe, lo muestra.
   * 3. Si no existe (error 404), genera uno nuevo.
   */
  const handleGenerateQR = (event) => {
    setQrError("");
    setCurrentQRData(null);
    setShowQRModal(true);

    withLoader(
      async () => {
        if (!event || !event.id) throw new Error("Datos del evento inválidos.");

        let qrData = null;

        // PASO 1: Intentar obtener un QR activo existente
        try {
          const response = await getActiveAttendanceQR(event.id);
          if (response.success && response.data) {
            qrData = response.data;
          }
        } catch (error) {
          // Si el error es 404, significa que NO hay QR, así que continuamos para crearlo.
          if (error.response && error.response.status !== 404) {
            throw error;
          }
        }

        // PASO 2: Si no se encontró QR activo, generamos uno nuevo
        if (!qrData) {
          const response = await generateAttendanceQR(event.id);
          qrData = response.data || response;
          
           // Actualizamos estado local para reflejar que ya tiene QR (para cambiar texto del botón)
           setEvents(prevEvents => 
            prevEvents.map(e => e.id === event.id ? { ...e, hasQR: true } : e)
          );
        }

        // PASO 3: Mostrar el QR
        if (qrData && qrData.qr_code_image) {
          return {
            qrCodeImage: qrData.qr_code_image,
            eventInfo: {
              titulo: event.titulo,
              fecha_hora: event.fecha_hora,
            },
          };
        } else {
          throw new Error("No se recibió la imagen del QR desde el backend.");
        }
      },
      { sectionId: 'qrGeneration', message: 'Procesando código QR...' }
    )
    .then(data => setCurrentQRData(data))
    .catch(err => setQrError(err.message || "Error al generar el QR."));
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCurrentQRData(null);
    setQrError("");
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      withLoader(() => deleteEvent(eventId), { message: "Eliminando evento..." })
        .then(() => {
          setEvents((prevEvents) => prevEvents.filter((ev) => ev.id !== eventId));
          alert("Evento eliminado exitosamente.");
        })
        .catch((err) => {
          alert(err.message || "Error al eliminar el evento.");
        });
    }
  };

  return (
    <OrganizerSidebar>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>{showAllEvents ? "Todos los Eventos" : "Mis Eventos"}</h1>
          <div className="admin-events-header-buttons">
            <button
              className="admin-events-btn toggle"
              onClick={() => setShowAllEvents((prev) => !prev)}
            >
              {showAllEvents ? "Ver Mis Eventos" : "Ver Todos los Eventos"}
            </button>
            <button
              className="admin-events-btn create"
              onClick={() => navigate("/organizer-events/create")}
            >
              <i className="fas fa-plus"></i>
              Crear nuevo evento
            </button>
          </div>
        </div>
        <div className="admin-events-panel">
          
          {pageLoading && !error && (
            <div className="orgs-loading">Cargando...</div>
          )}
          
          {error && (
            <div className="orgs-error">{error}</div>
          )}
          
          {!pageLoading && !error && events.length === 0 && (
            <div className="orgs-empty">No has creado eventos.</div>
          )}

          {!pageLoading && !error && events.length > 0 && (
            <div className="admin-events-table-wrap">
              <table className="admin-events-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Modalidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.titulo}</td>
                      <td>{new Date(ev.fecha_hora).toLocaleString()}</td>
                      <td>{ev.modalidad}</td>
                      <td>
                        <div className="admin-events-actions">
                          <button
                            className="admin-events-btn edit"
                            onClick={() => navigate(`/organizer-events/edit/${ev.id}`)}
                            aria-label={`Editar evento ${ev.titulo}`}
                          >
                            <i className="fas fa-edit"></i> Editar
                          </button>

                          {ev.activo && (
                            <button
                              className="admin-events-btn qr"
                              onClick={() => handleGenerateQR(ev)}
                              disabled={qrLoading}
                              aria-label={`QR para ${ev.titulo}`}
                              style={{ 
                                // Estilos dinámicos para diferenciar "Generar" de "Ver"
                                background: ev.hasQR ? 'rgba(33, 150, 243, 0.2)' : 'rgba(76, 175, 80, 0.2)', 
                                border: ev.hasQR ? '1px solid rgba(33, 150, 243, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)',
                                color: '#fff'
                              }}
                            >
                              <i className={`fas ${ev.hasQR ? 'fa-eye' : 'fa-qrcode'}`}></i> 
                              {/* Texto dinámico */}
                              {ev.hasQR ? " Ver QR" : " Generar QR"}
                            </button>
                          )}
                          
                          <button
                            className="admin-events-btn"
                            onClick={() => console.log('Ver detalles', ev.id)}
                            aria-label={`Ver detalles del evento ${ev.titulo}`}
                            style={{ background: 'rgba(33, 150, 243, 0.2)', border: '1px solid rgba(33, 150, 243, 0.3)', color: '#fff'}}
                          >
                            <i className="fas fa-eye"></i> Detalles
                          </button>

                          <button
                            className="admin-events-btn delete"
                            onClick={() => handleDeleteEvent(ev.id)}
                            aria-label={`Eliminar evento ${ev.titulo}`}
                            style={{ background: "rgba(244, 67, 54, 0.2)", border: "1px solid rgba(244, 67, 54, 0.3)", color: "#fff" }}
                          >
                            <i className="fas fa-trash"></i> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal QR */}
      {showQRModal && (
        <div className="attendance-qr-modal-overlay">
          <div className="attendance-qr-modal-content">
            {qrLoading ? (
              <>
                <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Procesando código QR...</p>
                <div className="loader-spinner loader-spinner-medium" style={{ margin: '1rem auto' }}></div>
              </>
            ) : qrError ? (
              <>
                <button onClick={handleCloseQRModal} className="qr-close-btn top-right" aria-label="Cerrar">×</button>
                <h2>Error</h2>
                <p style={{ color: '#ff5252', margin: '1rem 0' }}>{qrError}</p>
                <button onClick={handleCloseQRModal} className="qr-close-btn bottom">Cerrar</button>
              </>
            ) : currentQRData ? (
              <AttendanceQR
                qrCodeImage={currentQRData.qrCodeImage}
                eventInfo={currentQRData.eventInfo}
                onClose={handleCloseQRModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </OrganizerSidebar>
  );
}