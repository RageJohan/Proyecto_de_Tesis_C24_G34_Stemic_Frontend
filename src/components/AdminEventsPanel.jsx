import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  getEvents,
  generateAttendanceQR,
  getActiveAttendanceQR,
} from "../services/api";
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
    setCurrentQRData(null);
    setShowQRModal(true); // Mostrar modal cargando

    try {
      if (!event || !event.id) {
        throw new Error("Datos del evento inválidos.");
      }

      let qrData = null;

      // PASO 1: Intentar obtener un QR activo existente
      try {
        const response = await getActiveAttendanceQR(event.id);
        // Dependiendo de tu backend, la info suele venir en response.data
        if (response.success && response.data) {
          qrData = response.data;
          // console.log("QR existente encontrado");
        }
      } catch (error) {
        // Si el error es 404 (Not Found), significa que NO hay QR, así que continuamos para crearlo.
        // Si es otro error (ej. 500), lo dejamos pasar al catch principal.
        if (error.response && error.response.status !== 404) {
          throw error;
        }
        // Si es 404, simplemente qrData se mantiene null y seguimos al paso 2
      }

      // PASO 2: Si no se encontró QR activo, generamos uno nuevo
      if (!qrData) {
        // console.log("Generando nuevo QR...");
        const newQrResponse = await generateAttendanceQR(event.id);
        // generateAttendanceQR en tu api.js devuelve json.data o json directamente
        qrData = newQrResponse;
      }

      // PASO 3: Mostrar el resultado
      if (qrData && qrData.qr_code_image) {
        setCurrentQRData({
          qrCodeImage: qrData.qr_code_image,
          eventInfo: {
            titulo: event.titulo,
            fecha_hora: event.fecha_hora,
          },
        });

        // Opcional: Actualizar el estado local para que el botón cambie de texto en la UI inmediatamente
        // Esto marca el evento actual como "con QR" en la lista visual
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.id === event.id ? { ...ev, hasQR: true } : ev
          )
        );
      } else {
        throw new Error("No se recibió la imagen del QR desde el servidor.");
      }
    } catch (err) {
      console.error(err);
      setQrError(err.message || "Error al procesar el código QR.");
    } finally {
      setQrLoading(false);
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
                            onClick={() =>
                              navigate(`/admin-events/edit/${ev.id}`)
                            }
                            aria-label={`Editar evento ${ev.titulo}`}
                          >
                            <i className="fas fa-edit"></i> Editar
                          </button>

                          {/* QR Code Button */}
                          <button
                            className="admin-events-btn qr"
                            onClick={() => handleGenerateQR(ev)}
                            disabled={qrLoading}
                            aria-label={`QR para ${ev.titulo}`}
                            style={{
                              background: ev.hasQR
                                ? "rgba(33, 150, 243, 0.2)"
                                : "rgba(76, 175, 80, 0.2)", // Azul si ya tiene, Verde si es nuevo
                              border: ev.hasQR
                                ? "1px solid rgba(33, 150, 243, 0.3)"
                                : "1px solid rgba(76, 175, 80, 0.3)",
                              color: "#fff",
                            }}
                          >
                            <i
                              className={`fas ${
                                ev.hasQR ? "fa-eye" : "fa-qrcode"
                              }`}
                            ></i>
                            {/* Cambia el texto si sabemos localmente que ya tiene QR */}
                            {ev.hasQR ? " Ver QR" : " Generar QR"}
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
      {showQRModal &&
        (qrLoading ? (
          // Loading state inside the modal overlay
          <div className="attendance-qr-modal-overlay">
            <div
              className="attendance-qr-modal-content"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                Generando código QR...
              </p>
              {/* Optional: Add a spinner component here */}
              <div
                className="loader-spinner loader-spinner-medium"
                style={{ margin: "1rem auto" }}
              ></div>
            </div>
          </div>
        ) : qrError ? (
          // Error state inside the modal overlay
          <div className="attendance-qr-modal-overlay">
            <div className="attendance-qr-modal-content">
              {/* Added close button also for error state */}
              <button
                onClick={handleCloseQRModal}
                className="qr-close-btn top-right"
                aria-label="Cerrar"
              >
                ×
              </button>
              <h2>Error al generar QR</h2>
              <p style={{ color: "#ff5252", margin: "1rem 0" }}>{qrError}</p>
              <button
                onClick={handleCloseQRModal}
                className="qr-close-btn bottom"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : currentQRData ? (
          // Render the AttendanceQR component when data is available
          <AttendanceQR
            qrCodeImage={currentQRData.qrCodeImage}
            eventInfo={currentQRData.eventInfo}
            onClose={handleCloseQRModal} // Pass the close handler
          />
        ) : null) // Render nothing if modal is closed or data is not ready (and not loading/error)
      }
    </AdminSidebar>
  );
}
