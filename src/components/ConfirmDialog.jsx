import React from 'react';
import '../styles/ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  details,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = 'btn-confirmar',
  onConfirm,
  onCancel,
  icon = null,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          {icon && <span className="confirm-dialog-icon">{icon}</span>}
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-content">
          <p className="confirm-dialog-message">{message}</p>
          {details && (
            <div className="confirm-dialog-details">
              {typeof details === 'string' ? (
                <p>{details}</p>
              ) : (
                Array.isArray(details) ? (
                  <ul>
                    {details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                ) : details
              )}
            </div>
          )}
        </div>
        <div className="confirm-dialog-actions">
          <button 
            className="btn-cancelar" 
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button 
            className={confirmButtonClass}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
