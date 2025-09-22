import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../auth/components/Login';
import Register from '../auth/components/Register';
import ForgotPassword from '../auth/components/ForgotPassword';
import ResetPassword from '../auth/components/ResetPassword';
import Dashboard from '../components/Dashboard';

export default function AppRouter() {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
