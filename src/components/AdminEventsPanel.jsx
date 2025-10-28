import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getEvents, generateAttendanceQR } from "../services/api";
import AttendanceQR from "./AttendanceQR";
import "../styles/AdminEventsPanel.css";
import { useNavigate } from "react-router-dom";

export default function AdminEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // New states for QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRData, setCurrentQRData] = useState(null); // { qrCodeImage: 'data:image...', eventInfo: {...} }
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  /**
   * Fetches the list of events from the API.
   * @async
   */
  const fetchEvents = () => {
    setLoading(true);
    setError("");
    getEvents()
      .then((data) => {
        // Ensure data is treated as an array, handling different API response structures
        const eventsArray = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setEvents(eventsArray);
      })
      .catch(() => setError("No se pudieron cargar los eventos"))
      .finally(() => setLoading(false));
  };

  /**
   * Handles the generation and display of the attendance QR code for a specific event.
   * Sets loading state, shows the modal, calls the API, and updates state with QR data or error.
   * @param {object} event - The event object containing id, titulo, and fecha_hora.
   * @async
   */
  const handleGenerateQR = async (event) => {
    setQrLoading(true);
    setQrError("");
    setCurrentQRData(null); // Clear previous data
    setShowQRModal(true); // Show modal immediately with loading/initial state

    try {
      if (!event || !event.id) {
        throw new Error("Datos del evento inválidos.");
      }
      // Call the API function to generate the QR
      const qrData = await generateAttendanceQR(event.id);

      // Check if the response contains the QR image data
      if (qrData && qrData.qr_code_image) {
        setCurrentQRData({
          qrCodeImage: qrData.qr_code_image,
          eventInfo: { // Pass necessary event info to the QR component
            titulo: event.titulo,
            fecha_hora: event.fecha_hora,
          },
        });
      } else {
        // Handle cases where the backend response might be missing the image
        console.error("Respuesta del backend inesperada:", qrData);
        throw new Error("No se recibió la imagen del QR desde el backend.");
      }
    } catch (err) {
      setQrError(err.message || "Error desconocido al generar el QR.");
    } finally {
      setQrLoading(false); // Stop loading state regardless of outcome
    }
  };

  /**
   * Closes the QR code modal and resets related states.
   */
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCurrentQRData(null);
    setQrLoading(false);
    setQrError("");
  };

  return (
    <AdminSidebar>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>Panel de Eventos</h1>
        </div>
        <div className="admin-events-panel">
          <button
            className="admin-events-btn create"
            onClick={() => navigate("/admin-events/create")}
          >
            {/* Using FontAwesome icon */}
            <i className="fas fa-plus"></i>
            Crear evento
          </button>
          {loading ? (
            <div className="orgs-loading">Loading events...</div>
          ) : error ? (
            <div className="orgs-error">{error}</div>
          ) : events.length === 0 ? (
            <div className="orgs-empty">No events registered.</div>
          ) : (
            // Added wrapper div for horizontal scrolling on smaller screens
            <div className="admin-events-table-wrap">
              <table className="admin-events-table">
                <thead>
                  <tr>
                    {/* Simplified columns for better readability */}
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Modalidad</th>
                    {/* Removed 'Description' column, actions are more important */}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.titulo}</td>
                      <td>{new Date(ev.fecha_hora).toLocaleString()}</td>
                      <td>{ev.modalidad}</td>
                      {/* Removed description cell */}
                      <td>
                        <div className="admin-events-actions">
                          {/* Edit Button */}
                          <button
                            className="admin-events-btn edit"
                            onClick={() => navigate(`/admin-events/edit/${ev.id}`)}
                            aria-label={`Editar evento ${ev.titulo}`}
                          >
                            <i className="fas fa-edit"></i> Editar
                          </button>

                          {/* QR Code Button */}
                          <button
                            className="admin-events-btn qr" // Added specific class for styling if needed
                            onClick={() => handleGenerateQR(ev)}
                            disabled={qrLoading} // Disable while loading QR
                            aria-label={`Generar QR para ${ev.titulo}`}
                            style={{ background: 'rgba(76, 175, 80, 0.2)', border: '1px solid rgba(76, 175, 80, 0.3)', color: '#fff'}} // Inline style for distinction
                          >
                            <i className="fas fa-qrcode"></i> QR Asistencia
                          </button>

                          {/* Delete Button */}
                          <button
                            className="admin-events-btn delete"
                            aria-label={`Eliminar evento ${ev.titulo}`}
                            // Add onClick handler for delete functionality later
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

      {/* Conditional rendering for the QR Modal */}
      {showQRModal && (
        qrLoading ? (
          // Loading state inside the modal overlay
          <div className="attendance-qr-modal-overlay">
            <div className="attendance-qr-modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Generando código QR...</p>
              {/* Optional: Add a spinner component here */}
              <div className="loader-spinner loader-spinner-medium" style={{ margin: '1rem auto' }}></div>
            </div>
          </div>
        ) : qrError ? (
           // Error state inside the modal overlay
          <div className="attendance-qr-modal-overlay">
            <div className="attendance-qr-modal-content">
              {/* Added close button also for error state */}
              <button onClick={handleCloseQRModal} className="qr-close-btn top-right" aria-label="Cerrar">×</button>
              <h2>Error al generar QR</h2>
              <p style={{ color: '#ff5252', margin: '1rem 0' }}>{qrError}</p>
              <button onClick={handleCloseQRModal} className="qr-close-btn bottom">Cerrar</button>
            </div>
          </div>
        ) : currentQRData ? (
          // Render the AttendanceQR component when data is available
          <AttendanceQR
            qrCodeImage={currentQRData.qrCodeImage}
            eventInfo={currentQRData.eventInfo}
            onClose={handleCloseQRModal} // Pass the close handler
          />
        ) : null // Render nothing if modal is closed or data is not ready (and not loading/error)
      )}
    </AdminSidebar>
  );
}
