import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../auth/components/Login';
import Register from '../auth/components/Register';
import ForgotPassword from '../auth/components/ForgotPassword';
import ResetPassword from '../auth/components/ResetPassword';

import Dashboard from '../components/Dashboard';
import AboutUs from '../components/AboutUs';
import JoinUs from '../components/JoinUs';
import Events from '../components/Events';

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
  <Route path="/about-us" element={<AboutUs />} />
  <Route path="/join-us" element={<JoinUs />} />
  <Route path="/eventos" element={<Events />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
