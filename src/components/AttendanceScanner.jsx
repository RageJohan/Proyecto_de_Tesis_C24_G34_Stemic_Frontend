/**
 * @file src/components/AttendanceScanner.jsx
 * @description Componente modal optimizado usando la API Core de Html5Qrcode.
 * CORRECCIÓN: Soluciona el error "Cannot clear while scan is ongoing".
 */

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; 
import { verifyAttendance } from '../services/api';
import '../styles/AttendanceScanner.css';

export default function AttendanceScanner({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: 'info', text: 'Apunte la cámara al código QR...' });
  const scannerRef = useRef(null);
  
  const isMounted = useRef(true);
  const qrReaderId = "qr-reader-container"; 

  useEffect(() => {
    isMounted.current = true;

    const startScanner = async () => {
      // Evitar crear múltiples instancias si ya existe una
      if (scannerRef.current) return;

      const html5QrCode = new Html5Qrcode(qrReaderId);
      scannerRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleScanSuccess(html5QrCode, decodedText);
          },
          (errorMessage) => {
            // Ignorar errores de lectura por frame
          }
        );
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        if (isMounted.current) {
            setMessage({ type: 'error', text: 'No se pudo acceder a la cámara.' });
        }
      }
    };

    // Delay de 500ms para esperar la animación del modal
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      
      // Al desmontar, solo detenemos el stream de video.
      // NO llamamos a clear() aquí porque React destruirá el elemento DOM
      // y llamar a clear() mientras se detiene (stop) causa el error de consola.
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
             scannerRef.current.stop().catch(err => console.warn("Error al detener cámara:", err));
          }
        } catch (e) {
          console.warn("Excepción al limpiar scanner:", e);
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const handleScanSuccess = (scannerInstance, token) => {
    // Aquí sí usamos la secuencia stop -> clear porque el componente sigue montado
    // y queremos mostrar el estado de "Cargando" limpio.
    scannerInstance.stop().then(() => {
        // Limpiamos el canvas solo si la detención fue exitosa
        try { scannerInstance.clear(); } catch(e) { console.warn(e); }
        
        if (!isMounted.current) return;
        
        scannerRef.current = null; 
        setLoading(true);
        setMessage({ type: 'info', text: 'Procesando asistencia...' });
        
        verifyToken(token);
    }).catch(err => console.error("Error al detener tras scan:", err));
  };

  const verifyToken = async (token) => {
    try {
      const result = await verifyAttendance(token);
      
      if (!isMounted.current) return;

      setMessage({ type: 'success', text: result.message || '¡Asistencia registrada con éxito!' });
      setLoading(false);
      
      if (onSuccess) onSuccess(result);
      
      setTimeout(() => {
        if (isMounted.current) onClose();
      }, 2000);

    } catch (err) {
      if (!isMounted.current) return;

      setMessage({ type: 'error', text: err.message || 'Error al registrar asistencia.' });
      setLoading(false);
      
      // Reiniciar escáner tras error
      // Sugerimos al usuario cerrar y abrir para evitar bucles complejos
      setTimeout(() => {
         if (isMounted.current) {
             onClose(); 
         }
      }, 2500);
    }
  };

  return (
    <div className="scanner-overlay" onClick={!loading ? onClose : undefined}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>Registrar Asistencia</h3>
          <button onClick={onClose} className="scanner-close-btn" disabled={loading}>&times;</button>
        </div>
        <div className="scanner-body">
          <div id={qrReaderId} className="scanner-viewport"></div>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
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