import React, { useEffect, useState } from "react";
import OrganizerSidebar from "./OrganizerSidebar";
import { getSystemMetrics } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "../context/LoaderContext";
// Reutiliza los estilos existentes del panel
import "../styles/AdminEventsPanel.css"; 

// --- NUEVOS IMPORTS PARA GRÁFICOS ---
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// --- Componente de Tarjeta de Métrica (KPI) ---
const MetricCard = ({ title, value, icon, color }) => (
  <div className="metric-card" style={{ borderLeftColor: color }}>
    <div className="metric-card-info">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value" style={{ color: color }}>{value}</div>
    </div>
    <i className={`${icon} metric-card-icon`} style={{ color: color }}></i>
  </div>
);

// Colores para el gráfico de torta
const PIE_COLORS = ['#7957F2', '#2196F3', '#BF2A52'];

// --- Componente Principal del Dashboard ---
export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { withLoader } = useLoader();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    withLoader(
      () => getSystemMetrics(),
      { message: "Cargando métricas del sistema..." }
    )
      .then((data) => setMetrics(data))
      .catch((err) => {
        setError(err.message || "Error al cargar métricas");
        console.error("Error fetching metrics:", err);
      });
  }, [withLoader]);

  // Funciones de formato
  const formatNumber = (num) => (num || 0).toLocaleString('es-ES');
  const formatPercentage = (num) => `${(num || 0).toFixed(2)}%`;

  // --- Preparación de datos para gráficos ---
  
  let modalityData = []; // Inicializar como array vacío
  let comparisonData = []; // Inicializar como array vacío

  if (metrics) { // Verificar si 'metrics' existe antes de intentar acceder a sus propiedades
    // Datos para Gráfico de Modalidad (Pie Chart)
    modalityData = [
      { name: 'Virtual', value: (metrics.modalidad_distribution && metrics.modalidad_distribution.virtual) || 0 },
      { name: 'Presencial', value: (metrics.modalidad_distribution && metrics.modalidad_distribution.presencial) || 0 },
      { name: 'Híbrido', value: (metrics.modalidad_distribution && metrics.modalidad_distribution.hibrido) || 0 },
    ].filter((entry) => entry.value > 0); // Filtra para no mostrar modalidades con 0

    // Datos para Gráfico de Comparativa (Bar Chart)
    comparisonData = [
      { 
        name: 'Participación', 
        Inscripciones: metrics.overview?.total_inscripciones || 0, 
        Asistencias: metrics.overview?.total_asistencias || 0 
      }
    ];
  } 
  // Si 'metrics' es null, las variables mantendrán sus valores iniciales ([])

  // Componente para la leyenda personalizada del Pie Chart
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', textAlign: 'center' }}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} style={{ color: entry.color, display: 'inline-block', marginRight: '15px', fontSize: '14px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: entry.color,
              borderRadius: '50%',
              marginRight: '5px'
            }}></span>
            {/* Muestra el nombre y el porcentaje en la leyenda */}
            {entry.payload.name} ({entry.payload.percent ? (entry.payload.percent * 100).toFixed(0) : 0}%) 
          </li>
        ))}
      </ul>
    );
  };


  return (
    <OrganizerSidebar>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>Dashboard de Organizador</h1>
          <h3 style={{ color: "#e0d7ff" }}>
            Bienvenido, {user?.nombre || user?.email}
          </h3>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '2rem' }}>{error}</div>}

        {!metrics ? (
          <></> // El LoaderContext se encarga de mostrar el mensaje de carga
        ) : (
          <div className="admin-events-panel" style={{ padding: "1.5rem" }}>
            
            {/* --- Fila de KPIs --- */}
            <h2 className="panel-subtitle">Resumen General</h2>
            <div className="metrics-grid">
              <MetricCard
                title="Eventos Registrados"
                value={formatNumber(metrics.overview?.total_eventos)}
                icon="fas fa-calendar-check"
                color="#7957F2"
              />
              <MetricCard
                title="Eventos Pasados"
                value={formatNumber(metrics.overview?.eventos_realizados)}
                icon="fas fa-history"
                color="#BF2A52"
              />
              <MetricCard
                title="Eventos Próximos"
                value={formatNumber(metrics.overview?.eventos_programados)}
                icon="fas fa-calendar-day"
                color="#2196F3"
              />
              <MetricCard
                title="Total de Inscripciones"
                value={formatNumber(metrics.overview?.total_inscripciones)}
                icon="fas fa-users"
                color="#4CAF50"
              />
              <MetricCard
                title="Asistencias Verificadas"
                value={formatNumber(metrics.overview?.total_asistencias)}
                icon="fas fa-user-check"
                color="#FFC107"
              />
              <MetricCard
                title="Tasa de Asistencia"
                value={formatPercentage(metrics.overview?.porcentaje_asistencia)}
                icon="fas fa-chart-bar"
                color="#A6249D"
              />
               <MetricCard
                title="Satisfacción General"
                value={`${(metrics.satisfaccion_general?.promedio_general || 0).toFixed(2)} / 5`}
                icon="fas fa-star"
                color="#00BCD4"
              />
            </div>

            {/* --- NUEVA Fila de Gráficos --- */}
            <div className="dashboard-charts-row">
              
              {/* Gráfico 1: Modalidad (Pie Chart) */}
              <div className="chart-container">
                <h3>Distribución por Modalidad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modalityData}
                      cx="50%" // Centro X
                      cy="50%" // Centro Y
                      outerRadius={100} // Radio exterior
                      fill="#8884d8" // Color por defecto (sobrescrito por Cells)
                      dataKey="value" // Propiedad del objeto de datos a usar
                      labelLine={false} // No mostrar líneas de etiqueta
                      // Muestra el porcentaje directamente en el gráfico
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} 
                    >
                      {/* Asigna colores a cada sección */}
                      {modalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    {/* Tooltip (info al pasar el mouse) */}
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#2a2a3e', border: '1px solid #7957F280', borderRadius: '8px' }} // Estilo contenedor
                      itemStyle={{ color: '#e0d7ff' }} // Estilo del texto del tooltip
                      labelStyle={{ color: '#e0d7ff', fontWeight: 'bold' }} // Estilo de la etiqueta (nombre)
                      // Formatea el contenido del tooltip si es necesario
                      // formatter={(value, name) => [`${value} eventos`, name]} 
                    />
                    {/* Leyenda personalizada debajo del gráfico */}
                    <Legend content={renderCustomLegend} verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico 2: Inscripciones vs Asistencias (Bar Chart) */}
              <div className="chart-container">
                <h3>Inscripciones vs. Asistencias</h3>
                <ResponsiveContainer width="100%" height={300}>
                  {/* layout="vertical" hace que las barras sean horizontales */}
                  <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" /> {/* Líneas de la grilla */}
                    <XAxis type="number" stroke="#ccc" /> {/* Eje X (valores numéricos) */}
                    {/* Eje Y (categorías). 'hide' oculta la etiqueta 'Participación' */}
                    <YAxis type="category" dataKey="name" stroke="#ccc" hide /> 
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#2a2a3e', border: '1px solid #7957F280', borderRadius: '8px' }}
                      itemStyle={{ color: '#e0d7ff' }}
                      labelStyle={{ display: 'none' }} // Oculta la etiqueta 'Participación' en tooltip
                    />
                    <Legend wrapperStyle={{ color: '#ccc', paddingTop: '10px' }} verticalAlign="bottom" /> {/* Leyenda */}
                    {/* Define las barras */}
                    <Bar dataKey="Inscripciones" fill="#4CAF50" radius={[0, 5, 5, 0]} /> {/* Radio para bordes redondeados */}
                    <Bar dataKey="Asistencias" fill="#FFC107" radius={[0, 5, 5, 0]} /> 
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
            {/* --- Fin Fila de Gráficos --- */}

          </div>
        )}
      </div>
    </OrganizerSidebar>
  );
}