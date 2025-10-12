import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../auth/components/Login";
import Register from "../auth/components/Register";
import ForgotPassword from "../auth/components/ForgotPassword";
import ResetPassword from "../auth/components/ResetPassword";

import Dashboard from "../components/Dashboard";
import EventDetail from "../components/EventDetail";
import AboutUs from "../components/AboutUs";
import JoinUs from "../components/JoinUs";
import Events from "../components/Events";
import Participations from "../components/Participations";
import ProfileEdit from "../components/ProfileEdit";
import Organizations from "../components/Organizations";
import Home from "../components/Home";
import SurveyView from "../components/SurveyView";

import AdminEventsPanel from "../components/AdminEventsPanel";
import AdminPostulationsPanel from "../components/AdminPostulationsPanel";
import AdminAlliancesPanel from "../components/AdminAlliancesPanel";
import EventCreateView from "../components/EventCreateView";
import EventEditView from "../components/EventEditView";

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfileEdit /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/join-us" element={<JoinUs />} />
  <Route path="/events" element={<Events />} />
  <Route path="/event/:id" element={<EventDetail />} />
  <Route path="/organizations" element={<Organizations />} />
  <Route path="/admin-events" element={<AdminEventsPanel />} />
  <Route path="/admin-events/create" element={<EventCreateView />} />
  <Route path="/admin-events/edit/:id" element={<EventEditView />} />
  <Route path="/admin-applications" element={<AdminPostulationsPanel />} />
  <Route path="/admin-alliances" element={<AdminAlliancesPanel />} />
      <Route path="/participations" element={<Participations />} />
      <Route 
        path="/survey" 
        element={isAuthenticated ? <SurveyView /> : <Navigate to="/login" replace />} 
      />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
