import React from "react";
import "../styles/Loader.css";

export default function Loader({ 
  variant = 'fullscreen',  // 'fullscreen' | 'inline' | 'contained'
  size = 'medium',        // 'small' | 'medium' | 'large'
  message,               // Mensaje opcional
  color,                // Color personalizado
  className,           // Clases adicionales
  style,              // Estilos adicionales
  containerStyle     // Estilos para el contenedor
}) {
  const getLoaderClass = () => {
    const classes = ['loader-spinner'];
    if (size) classes.push(`loader-spinner-${size}`);
    if (className) classes.push(className);
    return classes.join(' ');
  };

  const getContainerClass = () => {
    const classes = ['loader-container'];
    if (variant === 'fullscreen') classes.push('loader-overlay');
    if (variant === 'inline') classes.push('loader-inline');
    if (variant === 'contained') classes.push('loader-contained');
    return classes.join(' ');
  };

  const spinnerStyle = {
    ...(color && { borderColor: `${color}40`, borderTopColor: color }),
    ...style
  };

  return (
    <div className={getContainerClass()} style={containerStyle}>
      <div className="loader-content">
        <div className={getLoaderClass()} style={spinnerStyle} />
        {message && <p className="loader-message">{message}</p>}
      </div>
    </div>
  );
}
