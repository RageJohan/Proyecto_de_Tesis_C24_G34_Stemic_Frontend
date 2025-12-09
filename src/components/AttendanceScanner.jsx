/**
 * @file src/components/AttendanceScanner.jsx
 * @description Componente modal que activa la cámara del usuario para escanear un QR.
 * VERSION OPTIMIZADA: Apaga la cámara inmediatamente al leer un código.
 */

import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyAttendance } from "../services/api";
import "../styles/AttendanceScanner.css";

export default function AttendanceScanner({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "info",
    text: "Apunte la cámara al código QR...",
  });
  const scannerRef = useRef(null);

  // Referencia para saber si el componente está montado (evitar errores en promesas)
  const isMounted = useRef(true);

  const qrReaderId = "qr-reader-container";

  // Definimos la función de inicialización fuera del useEffect para poder re-llamarla
  const initScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      qrReaderId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        showTorchButtonIfSupported: false,
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      // CAMBIO IMPORTANTE: Usamos clear() en lugar de pause()
      // Esto apaga la luz de la cámara inmediatamente.
      scanner
        .clear()
        .then(() => {
          scannerRef.current = null; // Limpiamos la referencia
          if (isMounted.current) {
            setLoading(true);
            setMessage({ type: "info", text: "Procesando asistencia..." });
            handleVerify(decodedText);
          }
        })
        .catch((err) => console.error("Error al detener cámara:", err));
    };

    const onScanFailure = (error) => {
      // Ignoramos errores de "no QR found"
    };

    scanner.render(onScanSuccess, onScanFailure);
  };

  useEffect(() => {
    isMounted.current = true;
    // Pequeño timeout para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      initScanner();
    }, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const handleVerify = async (token) => {
    try {
      const result = await verifyAttendance(token);

      if (!isMounted.current) return;

      setMessage({
        type: "success",
        text: result.message || "¡Asistencia registrada con éxito!",
      });
      setLoading(false);

      if (onSuccess) onSuccess(result);

      // Cerrar modal
      setTimeout(() => {
        if (isMounted.current) onClose();
      }, 2000);
    } catch (err) {
      if (!isMounted.current) return;

      // Error en validación
      setMessage({
        type: "error",
        text: err.message || "Error al registrar asistencia.",
      });
      setLoading(false);

      // CAMBIO: Como apagamos la cámara, debemos reiniciarla si hubo error
      // Esperamos 2 segundos para que el usuario lea el mensaje de error
      setTimeout(() => {
        if (isMounted.current) {
          setMessage({ type: "info", text: "Reiniciando cámara..." });
          // Reiniciamos el escáner
          initScanner();
        }
      }, 2500);
    }
  };

  return (
    <div className="scanner-overlay" onClick={!loading ? onClose : undefined}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>Registrar Asistencia</h3>
          <button
            onClick={onClose}
            className="scanner-close-btn"
            disabled={loading}
          >
            &times;
          </button>
        </div>
        <div className="scanner-body">
          <div id={qrReaderId} className="scanner-viewport"></div>

          {/* Si está cargando y la cámara se apagó, mostramos un spinner aquí para que no quede vacío */}
          {loading && !scannerRef.current && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Verificando...</p>
            </div>
          )}

          {message.text && (
            <div className={`scanner-message scanner-${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
