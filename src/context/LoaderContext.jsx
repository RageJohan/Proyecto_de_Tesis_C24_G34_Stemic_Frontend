import React, { createContext, useContext, useState, useCallback } from "react";

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  // Estado para manejar múltiples loaders
  const [loaders, setLoaders] = useState({
    global: { active: false, message: null },
    sections: {}
  });

  // Mostrar loader global
  const showGlobalLoader = useCallback((message = null) => {
    setLoaders(prev => ({
      ...prev,
      global: { active: true, message }
    }));
  }, []);

  // Ocultar loader global
  const hideGlobalLoader = useCallback(() => {
    setLoaders(prev => ({
      ...prev,
      global: { active: false, message: null }
    }));
  }, []);

  // Mostrar loader para una sección específica
  const showSectionLoader = useCallback((sectionId, message = null) => {
    setLoaders(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { active: true, message }
      }
    }));
  }, []);

  // Ocultar loader de una sección
  const hideSectionLoader = useCallback((sectionId) => {
    setLoaders(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { active: false, message: null }
      }
    }));
  }, []);

  // Verificar si hay algún loader activo
  const isLoading = useCallback((sectionId = null) => {
    if (sectionId) {
      return loaders.sections[sectionId]?.active || false;
    }
    return loaders.global.active;
  }, [loaders]);

  // Obtener mensaje del loader
  const getLoaderMessage = useCallback((sectionId = null) => {
    if (sectionId) {
      return loaders.sections[sectionId]?.message || null;
    }
    return loaders.global.message;
  }, [loaders]);

  // Wrapper para funciones asíncronas
  const withLoader = useCallback(async (fn, options = {}) => {
    const { 
      sectionId = null, 
      message = null,
      errorHandler = null 
    } = options;

    try {
      if (sectionId) {
        showSectionLoader(sectionId, message);
      } else {
        showGlobalLoader(message);
      }

      const result = await fn();
      return result;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error('Error en operación:', error);
      }
      throw error;
    } finally {
      if (sectionId) {
        hideSectionLoader(sectionId);
      } else {
        hideGlobalLoader();
      }
    }
  }, [showGlobalLoader, hideGlobalLoader, showSectionLoader, hideSectionLoader]);

  // Compatibilidad con la API antigua
  const setLoading = useCallback((isLoading) => {
    if (isLoading) {
      showGlobalLoader();
    } else {
      hideGlobalLoader();
    }
  }, [showGlobalLoader, hideGlobalLoader]);

  const loading = isLoading();

  return (
    <LoaderContext.Provider value={{
      // Nueva API
      isLoading,
      getLoaderMessage,
      showGlobalLoader,
      hideGlobalLoader,
      showSectionLoader,
      hideSectionLoader,
      withLoader,
      // API antigua para compatibilidad
      loading,
      setLoading
    }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader debe ser usado dentro de un LoaderProvider');
  }
  return context;
}
