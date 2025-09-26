import AppRouter from './routes/AppRouter';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { LoaderProvider } from './context/LoaderContext';
import Loader from './components/Loader';
import React from 'react';
import { useLoader } from './context/LoaderContext';

function GlobalLoader() {
  const { loading } = useLoader();
  return loading ? <Loader /> : null;
}

function App() {
  return (
    <LoaderProvider>
      <AuthProvider>
        <GlobalLoader />
        <AppRouter />
      </AuthProvider>
    </LoaderProvider>
  );
}

export default App;
