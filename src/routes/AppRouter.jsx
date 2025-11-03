import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ... (imports existentes: Login, Register, Home, Events, etc.)
import Home from "../components/Home";
import Login from "../auth/components/Login";
import Register from "../auth/components/Register";
import ForgotPassword from "../auth/components/ForgotPassword";
import ResetPassword from "../auth/components/ResetPassword";
import Dashboard from "../components/Dashboard"; // Este parece ser un componente antiguo/de prueba
import EventDetail from "../components/EventDetail";
import AboutUs from "../components/AboutUs";
import JoinUs from "../components/JoinUs";
import Events from "../components/Events";
import Participations from "../components/Participations";
import ProfileEdit from "../components/ProfileEdit";
import Organizations from "../components/Organizations";
import SurveyView from "../components/SurveyView";
import AdminEventsPanel from "../components/AdminEventsPanel";
import AdminPostulationsPanel from "../components/AdminPostulationsPanel";
import AdminAlliancesPanel from "../components/AdminAlliancesPanel";
import AdminDashboard from "../components/AdminDashboard";
import AdminReportsPanel from "../components/AdminReportsPanel";
import EventCreateView from "../components/EventCreateView";
import EventEditView from "../components/EventEditView";

// --- NUEVOS IMPORTS DE ORGANIZADOR ---
import OrganizerDashboard from "../components/OrganizerDashboard";
import OrganizerEventsPanel from "../components/OrganizerEventsPanel";
import OrganizerReportsPanel from "../components/OrganizerReportsPanel";

// Componente para proteger rutas (asumiendo que ya existe y funciona)
const ProtectedRoute = ({ element, requiredRoles = [], fallback = "/login" }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // Muestra un loader genérico mientras se verifica la autenticación
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Cargando...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  // Admin tiene acceso a todo
  if (user?.rol === 'admin') {
    return element;
  }
  
  // Verifica si el rol del usuario está en los roles requeridos
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.rol)) {
     // Si no tiene el rol, redirige al inicio
     return <Navigate to="/" replace />;
  }
  
  return element;
};

export default function AppRouter() {
  const { isAuthenticated, user } = useAuth();
  
  // Redirección inteligente post-login (desde /dashboard)
  const getDashboardPath = () => {
  if (user?.rol === 'admin') return '/admin-dashboard';
    if (user?.rol === 'organizador') return '/organizer-dashboard'; // NUEVO
    return '/'; // Ruta por defecto para usuarios normales
  };

  return (
    <Routes>
      {/* --- RUTAS DE AUTENTICACIÓN --- */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <ResetPassword />}
      />
      {/* Redirección de /dashboard a la ruta de rol */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Navigate to="/login" replace />
        }
      />

      {/* --- RUTAS PÚBLICAS Y DE USUARIO --- */}
      <Route path="/" element={<Home />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/join-us" element={<JoinUs />} />
      <Route path="/events" element={<Events />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/organizations" element={<Organizations />} />

      {/* Rutas protegidas para cualquier usuario logueado */}
      <Route 
        path="/profile" 
        element={<ProtectedRoute element={<ProfileEdit />} requiredRoles={['usuario', 'organizador']} />} 
      />
      <Route 
        path="/participations" 
        element={<ProtectedRoute element={<Participations />} requiredRoles={['usuario', 'organizador']} />} 
      />
      <Route 
        path="/survey/:eventId" 
        element={<ProtectedRoute element={<SurveyView />} requiredRoles={['usuario', 'organizador']} />} 
      />

      {/* --- RUTAS DE ADMINISTRADOR --- */}
      <Route
        path="/admin-events"
        element={<ProtectedRoute element={<AdminEventsPanel />} requiredRoles={['admin']} />}
      />
      <Route
        path="/admin-reports"
        element={<ProtectedRoute element={<AdminReportsPanel />} requiredRoles={['admin']} />}
      />
      <Route
        path="/admin-dashboard"
        element={<ProtectedRoute element={<AdminDashboard />} requiredRoles={['admin']} />}
      />
       <Route
        path="/admin-events/create"
        element={<ProtectedRoute element={<EventCreateView />} requiredRoles={['admin']} />}
      />
       <Route
        path="/admin-events/edit/:id"
        element={<ProtectedRoute element={<EventEditView />} requiredRoles={['admin']} />}
      />
      <Route
        path="/admin-applications"
        element={<ProtectedRoute element={<AdminPostulationsPanel />} requiredRoles={['admin']} />}
      />
      <Route
        path="/admin-alliances"
        element={<ProtectedRoute element={<AdminAlliancesPanel />} requiredRoles={['admin']} />}
      />

      {/* --- NUEVAS RUTAS DE ORGANIZADOR --- */}
      {/* El rol 'admin' también tendrá acceso gracias a la lógica de ProtectedRoute */}
      <Route
        path="/organizer-dashboard"
        element={<ProtectedRoute element={<OrganizerDashboard />} requiredRoles={['organizador']} />}
      />
      <Route
        path="/organizer-events"
        element={<ProtectedRoute element={<OrganizerEventsPanel />} requiredRoles={['organizador']} />}
      />
      {/* Reutilizamos las vistas de creación/edición de eventos */}
      <Route
        path="/organizer-events/create"
        element={<ProtectedRoute element={<EventCreateView />} requiredRoles={['organizador']} />}
      />
      <Route
        path="/organizer-events/edit/:id"
        element={<ProtectedRoute element={<EventEditView />} requiredRoles={['organizador']} />}
      />
      <Route
        path="/organizer-reports"
        element={<ProtectedRoute element={<OrganizerReportsPanel />} requiredRoles={['organizador']} />}
      />

      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}