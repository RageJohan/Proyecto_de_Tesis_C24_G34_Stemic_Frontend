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
  try {
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services no está disponible');
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Elemento con ID ${elementId} no encontrado`);
      return;
    }

    window.google.accounts.id.initialize({
      client_id,
      callback,
      cancel_on_tap_outside: false,
      ux_mode: 'popup',
    });

    window.google.accounts.id.renderButton(
      element,
      {
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'continue_with',
        locale: 'es_ES',
      }
    );
  } catch (error) {
    console.error('Error al renderizar el botón de Google:', error);
    // Mostrar un botón alternativo si falla el renderizado
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <button 
          class="google-fallback-button" 
          style="
            width: 320px;
            padding: 10px;
            border-radius: 20px;
            border: 1px solid #ccc;
            background: #fff;
            color: #757575;
            font-family: 'Roboto', sans-serif;
            font-size: 14px;
            cursor: not-allowed;
          "
          disabled
        >
          Inicio de sesión con Google no disponible
        </button>
      `;
    }
  }
}
