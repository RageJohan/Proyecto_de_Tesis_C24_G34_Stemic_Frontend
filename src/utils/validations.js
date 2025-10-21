// Validar URL
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Validar imagen
export function validateImage(file) {
  const errors = [];
  
  // Validar que sea un archivo
  if (!(file instanceof File)) {
    errors.push('No se ha seleccionado ningún archivo');
    return errors;
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('El archivo debe ser una imagen (JPG, PNG, GIF o WEBP)');
  }

  // Validar tamaño (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB en bytes
  if (file.size > maxSize) {
    errors.push('La imagen no debe superar los 2MB');
  }

  return errors;
}

// Validar dimensiones de imagen
export function validateImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const errors = [];
        
        // Validar dimensiones mínimas
        if (img.width < 200 || img.height < 200) {
          errors.push('La imagen debe tener al menos 200x200 píxeles');
        }
        
        // Validar dimensiones máximas
        if (img.width > 2000 || img.height > 2000) {
          errors.push('La imagen no debe superar los 2000x2000 píxeles');
        }
        
        // Validar proporción
        const ratio = img.width / img.height;
        if (ratio < 0.5 || ratio > 2) {
          errors.push('La proporción de la imagen debe estar entre 1:2 y 2:1');
        }
        
        resolve(errors);
      };
      
      img.onerror = () => {
        reject(['Error al procesar la imagen']);
      };
    };
    
    reader.onerror = () => {
      reject(['Error al leer el archivo']);
    };
  });
}

// Validar campos del formulario de alianza
export function validateAllianceForm(form) {
  const errors = {};

  // Validar nombre
  if (!form.nombre) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (form.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  } else if (form.nombre.length > 100) {
    errors.nombre = 'El nombre no debe superar los 100 caracteres';
  }

  // Validar descripción
  if (!form.descripcion) {
    errors.descripcion = 'La descripción es obligatoria';
  } else if (form.descripcion.length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
  } else if (form.descripcion.length > 500) {
    errors.descripcion = 'La descripción no debe superar los 500 caracteres';
  }

  // Validar sitio web
  if (form.sitio_web && !isValidUrl(form.sitio_web)) {
    errors.sitio_web = 'La URL del sitio web no es válida';
  }

  return errors;
}
