import React from "react";

export default function ErrorMessage({ message, type = "error", onClose }) {
  if (!message) return null;
  return (
    <div className={`login-message ${type}`} style={{ position: 'relative' }}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            background: 'transparent',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#888'
          }}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}
