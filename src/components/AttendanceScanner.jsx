/**
 * @file src/components/AttendanceScanner.jsx
 * @description Componente modal optimizado usando la API Core de Html5Qrcode.
 * CORRECCIÓN: Agregado bloqueo (isProcessing) para evitar que Vercel bloquee por spam de peticiones.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; 
import { verifyAttendance } from '../services/api';
import '../styles/AttendanceScanner.css';

export default function AttendanceScanner({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: 'info', text: 'Apunte la cámara al código QR...' });
  const scannerRef = useRef(null);
  
  // Bloqueo para evitar múltiples lecturas del mismo QR
  const isProcessing = useRef(false);
  
  const isMounted = useRef(true);
  const qrReaderId = "qr-reader-container"; 

  useEffect(() => {
    isMounted.current = true;
    isProcessing.current = false; // Reset al montar

    const startScanner = async () => {
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
            // --- CAMBIO CRÍTICO: BLOQUEO DE PROCESAMIENTO ---
            // Si ya estamos procesando un código, ignoramos cualquier otra lectura
            if (isProcessing.current) return;
            
            // Activamos el bloqueo inmediatamente
            isProcessing.current = true;
            
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

    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      
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
    scannerInstance.stop().then(() => {
        try { scannerInstance.clear(); } catch(e) { console.warn(e); }
        
        if (!isMounted.current) return;
        
        scannerRef.current = null; 
        setLoading(true);
        setMessage({ type: 'info', text: 'Procesando asistencia...' });
        
        verifyToken(token);
    }).catch(err => {
        console.error("Error al detener tras scan:", err);
        // Si falla el stop, liberamos el bloqueo para intentar de nuevo
        isProcessing.current = false; 
    });
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

      console.error("Error de verificación:", err);

      // Si el error es HTML (Vercel Firewall), mostramos mensaje amigable
      let errorMsg = err.message || 'Error al registrar asistencia.';
      if (errorMsg.includes("Unexpected token") || errorMsg.includes("text/html")) {
          errorMsg = "Error de conexión. Intente nuevamente.";
      }

      setMessage({ type: 'error', text: errorMsg });
      setLoading(false);
      
      // Permitir reintentar después del error
      setTimeout(() => {
         if (isMounted.current) {
             // Cerramos el modal para forzar un reinicio limpio del componente
             // Esto es más seguro que intentar reiniciar la cámara en el mismo estado
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