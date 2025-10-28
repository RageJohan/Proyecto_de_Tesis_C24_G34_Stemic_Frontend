import React from 'react';
import '../styles/AttendanceQR.css'; // Crearemos este archivo CSS en el siguiente paso

/**
 * Componente para mostrar un código QR de asistencia.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.qrCodeImage - La imagen del código QR en formato data URL.
 * @param {object} props.eventInfo - Información básica del evento (título, fecha).
 * @param {string} props.eventInfo.titulo - Título del evento.
 * @param {string} props.eventInfo.fecha_hora - Fecha y hora del evento.
 * @param {Function} props.onClose - Función para cerrar la vista del QR.
 */
export default function AttendanceQR({ qrCodeImage, eventInfo, onClose }) {
  if (!qrCodeImage) {
    return (
      <div className="attendance-qr-modal-overlay">
        <div className="attendance-qr-modal-content">
          <p>No se pudo cargar el código QR.</p>
          <button onClick={onClose} className="qr-close-btn">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-qr-modal-overlay" onClick={onClose}>
      {/* Detener la propagación para que el clic dentro no cierre el modal */}
      <div className="attendance-qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="qr-close-btn top-right" aria-label="Cerrar">×</button>
        <h2>Código QR de Asistencia</h2>
        {eventInfo && (
          <div className="qr-event-info">
            <p><strong>Evento:</strong> {eventInfo.titulo || 'N/A'}</p>
            <p><strong>Fecha:</strong> {eventInfo.fecha_hora ? new Date(eventInfo.fecha_hora).toLocaleString() : 'N/A'}</p>
          </div>
        )}
        <div className="qr-code-container">
          <img src={qrCodeImage} alt="Código QR de Asistencia" className="qr-code-image" />
        </div>
        <p className="qr-instructions">
          Muestra este código QR a los asistentes para que registren su asistencia.
        </p>
        <button onClick={onClose} className="qr-close-btn bottom">Cerrar</button>
      </div>
    </div>
  );
}