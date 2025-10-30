/**
 * @file src/components/AttendanceScanner.jsx
 * @description Componente modal que activa la cámara del usuario para escanear un QR
 * y registrar la asistencia a un evento.
 * @requires react
 * @requires html5-qrcode
 * @requires ../services/api
 * @requires ../styles/AttendanceScanner.css
 */

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyAttendance } from '../services/api';
import '../styles/AttendanceScanner.css';

/**
 * Componente AttendanceScanner
 * Muestra un modal con un visor de cámara para escanear códigos QR.
 * Al escanear un QR válido, llama al endpoint de la API para verificar la asistencia.
 *
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} [props.onSuccess] - (Opcional) Callback para ejecutar al registrar asistencia exitosamente.
 * @returns {JSX.Element}
 */
export default function AttendanceScanner({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: 'info', text: 'Apunte la cámara al código QR...' });
  const scannerRef = useRef(null); // Ref para almacenar la instancia del escáner

  // ID único para el contenedor del escáner
  const qrReaderId = "qr-reader-container"; 

  useEffect(() => {
    // Evita que se inicialice varias veces (ej. por React.StrictMode)
    if (scannerRef.current) {
      return;
    }

    // Inicializa el escáner
    const scanner = new Html5QrcodeScanner(
      qrReaderId, // ID del elemento en el DOM
      {
        fps: 10, // Frames por segundo
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          // Calcula el tamaño de la caja de escaneo (ej. 80% del lado más corto)
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.8);
          return { width: size, height: size };
        },
        rememberLastUsedCamera: true,
      },
      false // verbose = false
    );

    scannerRef.current = scanner;

    /**
     * Callback de éxito del escaneo.
     * @param {string} decodedText - El texto decodificado del QR (el token).
     * @param {object} decodedResult - El resultado completo del escaneo.
     */
    const onScanSuccess = (decodedText) => {
      // Detener el escáner y mostrar carga
      scanner.pause();
      setLoading(true);
      setMessage({ type: 'info', text: 'Procesando asistencia...' });
      
      // Enviar el token al backend
      handleVerify(decodedText);
    };

    /**
     * Callback de fallo del escaneo (opcional).
     * @param {string} error - El mensaje de error.
     */
    const onScanFailure = (error) => {
      // No mostramos errores de "QR no encontrado" porque ocurren en cada frame.
      console.warn(`Scan failure: ${error}`);
    };
    

    // Inicia el renderizado del escáner
    scanner.render(onScanSuccess, onScanFailure);

    // Hook de limpieza: se ejecuta cuando el componente se desmonta
    return () => {
      if (scannerRef.current) {
        // Detiene la cámara y limpia los recursos
        scannerRef.current.clear().catch(err => {
          console.error("Error al limpiar Html5QrcodeScanner:", err);
        });
        scannerRef.current = null;
      }
    };
  }, []); // El array vacío es intencional para que solo se ejecute una vez

  /**
   * Llama a la API para verificar la asistencia con el token del QR.
   * @param {string} token - El token escaneado.
   */
  const handleVerify = async (token) => {
    try {
      const result = await verifyAttendance(token);
      setMessage({ type: 'success', text: result.message || '¡Asistencia registrada con éxito!' });
      setLoading(false);
      
      // Llama al callback de éxito (si existe)
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Cierra automáticamente el modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      // Muestra el error del backend (ej. "QR inválido", "Asistencia ya registrada")
      setMessage({ type: 'error', text: err.message || 'Error al registrar asistencia.' });
      setLoading(false);
      
      // Reanuda el escáner después de un breve retraso para que el usuario lea el error
      setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.resume();
          setMessage({ type: 'info', text: 'Inténtalo de nuevo...' });
        }
      }, 2000);
    }
  };

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>Registrar Asistencia</h3>
          <button onClick={onClose} className="scanner-close-btn" disabled={loading}>&times;</button>
        </div>
        <div className="scanner-body">
          {/* El contenedor donde se renderizará el escáner */}
          <div id={qrReaderId} className="scanner-viewport"></div>
          
          {/* Muestra mensajes de estado (info, éxito, error) */}
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