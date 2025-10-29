import React, { useEffect, useState } from "react";
import OrganizerSidebar from "./OrganizerSidebar";
import { getMyEventsForOrganizer, generateAttendanceQR } from "../services/api";
import AttendanceQR from "./AttendanceQR";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../context/LoaderContext";
// Reutiliza estilos existentes
import "../styles/AdminEventsPanel.css";
import "../styles/AttendanceQR.css"; // Para el modal del QR

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    withLoader(
      getMyEventsForOrganizer,
      { message: 'Cargando tus eventos...' }
    )
      .then((data) => {
        const eventsArray = Array.isArray(data) ? data : data.data || [];
        setEvents(eventsArray);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "No se pudieron cargar tus eventos");
      });
  };

  const handleGenerateQR = (event) => {
    setQrError("");
    setCurrentQRData(null);
    setShowQRModal(true);

    withLoader(
      async () => {
        if (!event || !event.id) throw new Error("Datos del evento inválidos.");
        const qrData = await generateAttendanceQR(event.id);
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
      { sectionId: 'qrGeneration', message: 'Generando código QR...' }
    )
    .then(data => setCurrentQRData(data))
    .catch(err => setQrError(err.message || "Error al generar el QR."));
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCurrentQRData(null);
    setQrError("");
  };

  return (
    <OrganizerSidebar>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>Mis Eventos</h1>
        </div>
        <div className="admin-events-panel">
          <button
            className="admin-events-btn create"
            onClick={() => navigate("/organizer-events/create")}
          >
            <i className="fas fa-plus"></i>
            Crear nuevo evento
          </button>
          
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
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.titulo}</td>
                      <td>{new Date(ev.fecha_hora).toLocaleString()}</td>
                      <td>{ev.modalidad}</td>
                      <td>{ev.activo ? 'Sí' : 'No'}</td>
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
                              aria-label={`Generar QR para ${ev.titulo}`}
                            >
                              <i className="fas fa-qrcode"></i> QR Asistencia
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
                <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Generando código QR...</p>
                <div className="loader-spinner loader-spinner-medium" style={{ margin: '1rem auto' }}></div>
              </>
            ) : qrError ? (
              <>
                <button onClick={handleCloseQRModal} className="qr-close-btn top-right" aria-label="Cerrar">×</button>
                <h2>Error al generar QR</h2>
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