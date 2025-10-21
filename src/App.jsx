import AppRouter from "./routes/AppRouter";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider } from "./context/LoaderContext";
import { NotificationProvider } from "./context/NotificationContext";
import Loader from "./components/Loader";
import React from "react";
import { useLoader } from "./context/LoaderContext";

function GlobalLoader() {
  const { loading } = useLoader();
  return loading ? <Loader /> : null;
}

function App() {
  return (
    <LoaderProvider>
      <NotificationProvider>
        <AuthProvider>
          <GlobalLoader />
          <AppRouter />
        </AuthProvider>
      </NotificationProvider>
    </LoaderProvider>
  );
}

export default App;
