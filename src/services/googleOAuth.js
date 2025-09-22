// src/services/googleOAuth.js
// Utilidad para cargar el script de Google Identity Services y obtener el id_token

export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-oauth')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-oauth';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function googlePrompt(client_id, callback) {
  window.google.accounts.id.initialize({
    client_id,
    callback,
  });
  window.google.accounts.id.prompt();
}

export function renderGoogleButton(client_id, callback, elementId) {
  window.google.accounts.id.initialize({
    client_id,
    callback,
  });
  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: 'filled_blue', // Botón sólido azul
      size: 'large',
      shape: 'pill', // Bordes redondeados
      width: 320 // Más ancho
    }
  );
}
