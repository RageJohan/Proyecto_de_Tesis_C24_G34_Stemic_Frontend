import React, { useState } from 'react';
import defaultAvatar from '../assets/default-avatar.svg';

const CloudinaryImage = ({ 
  src, 
  alt = 'Imagen', 
  className = '', 
  fallbackSrc = defaultAvatar,
  ...props 
}) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default CloudinaryImage;
