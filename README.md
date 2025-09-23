# STEMIC Frontend

Frontend de la aplicación STEMIC construido con React, Vite y React Router.


## Características

- ✅ **Enrutamiento con React Router**: Navegación completa por URLs
- 🔐 **Autenticación**: Login, registro, recuperación de contraseña
- 🌐 **Integración con Google OAuth**: Autenticación con Google
- 📱 **Responsive**: Diseño adaptativo
- ⚡ **Vite**: Desarrollo rápido con Hot Module Replacement
- 🛡️ **Consentimiento y privacidad**: El registro requiere la aceptación de los Términos y Condiciones y el Aviso de Privacidad, con enlaces visibles a ambos documentos.


## Rutas Disponibles

- `/` - Vista principal pública
- `/login` - Página de inicio de sesión
- `/register` - Página de registro (con consentimiento obligatorio)
- `/forgot-password` - Recuperación de contraseña
- `/reset-password` - Restablecimiento de contraseña
- `/dashboard` - Panel principal (requiere autenticación)
## Privacidad y consentimiento

Durante el registro, el usuario debe aceptar explícitamente los [Términos y Condiciones](/terminos.pdf) y el [Aviso de Privacidad](/aviso-privacidad.md). Ambos documentos están disponibles desde el formulario de registro y deben ser leídos y aceptados para crear una cuenta.

El aviso de privacidad cumple con la Ley N° 29733 (Ley de Protección de Datos Personales).

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo en el puerto 3001
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la aplicación de producción

## Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` con las siguientes variables:
   ```bash
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=tu-google-client-id
   VITE_PORT=3001
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## Integración con Backend

El frontend está configurado para comunicarse con el backend en `http://localhost:3000`. Asegúrate de que el backend esté ejecutándose antes de usar la aplicación.

### Rutas de la API utilizadas:
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/google` - Autenticación con Google
- `POST /api/auth/forgot-password` - Recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecimiento de contraseña

## Tecnologías

- React 19.1.1
- React Router DOM 6.x
- Vite 7.1.6
- Google OAuth
- Firebase (para OAuth)
