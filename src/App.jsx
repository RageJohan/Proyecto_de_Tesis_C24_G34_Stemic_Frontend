import AppRouter from "./routes/AppRouter";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider } from "./context/LoaderContext";
import { NotificationProvider } from "./context/NotificationContext";
import Loader from "./components/Loader";
import React from "react";
import { useLoader } from "./context/LoaderContext";

function GlobalLoader() {
  const { isLoading, getLoaderMessage } = useLoader();
  const isGlobalLoading = isLoading();
  const message = getLoaderMessage();
  
  if (!isGlobalLoading) return null;

  return (
    <Loader 
      variant="fullscreen"
      size="large"
      message={message}
      containerStyle={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    />
  );
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
