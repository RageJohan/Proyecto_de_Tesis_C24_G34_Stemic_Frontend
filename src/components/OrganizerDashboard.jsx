import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import { useLoader } from '../context/LoaderContext'; // <-- Ya no lo necesitamos
import { useNotification } from '../context/NotificationContext';
import { getSystemMetrics } from '../services/api';
import OrganizerSidebar from './OrganizerSidebar';

// --- IMPORTS PARA CHART.JS ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// --- IMPORTS PARA REACT-ICONS ---
import { FaCalendarAlt, FaCalendarCheck, FaClock, FaUsers, FaUserCheck, FaChartBar, FaStar } from 'react-icons/fa';

// --- Estilos ---
import "../styles/AdminEventsPanel.css"; 
import "../styles/OrganizerDashboard.css"; 

// Registrar Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * Componente de Tarjeta de Métrica (KPI)
 */
const StatsCard = ({ title, value, icon, color }) => (
  <div className="metric-card" style={{ borderLeftColor: color }}>
    <div className="metric-card-info">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value" style={{ color: color }}>{value}</div>
    </div>
    <div className="metric-card-icon" style={{ color: color }}>
      {icon}
    </div>
  </div>
);

/**
 * Componente Principal del Dashboard
 */
export default function OrganizerDashboard() {
  const { user } = useAuth();
  // const { showLoader, hideLoader } = useLoader(); // <-- Eliminado
  const { showNotification } = useNotification();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true); // <-- Este es nuestro único control de carga

  useEffect(() => {
    const fetchMetrics = async () => {
      // No usamos showLoader()
      setLoading(true); // <-- Usamos el estado local
      try {
        const data = await getSystemMetrics();
        setMetrics(data || {}); 
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        showNotification(error.message || 'No se pudieron cargar las métricas', 'error');
        setMetrics(null); 
      } finally {
        // No usamos hideLoader()
        setLoading(false); // <-- Usamos el estado local
      }
    };
    
    fetchMetrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- ¡LA CLAVE! Array vacío para que se ejecute 1 SOLA VEZ.

  // Funciones de formato
  const formatNumber = (num) => (num || 0).toLocaleString('es-ES');
  const formatPercentage = (num) => `${(Number(num) || 0).toFixed(2)}%`;

  // --- Lógica de Renderizado ---

  // 1. Estado de Carga (ahora funciona correctamente)
  if (loading) {
    return (
      <OrganizerSidebar>
        <div className="admin-events-container">
          <div className="admin-events-header">
            <h1>Dashboard de Organizador</h1>
          </div>
          <div className="dashboard-loading" style={{ padding: '2rem', textAlign: 'center' }}>
            Cargando métricas...
          </div>
        </div>
      </OrganizerSidebar>
    );
  }

  // 2. Estado de Error
  if (metrics === null) {
    return (
      <OrganizerSidebar>
        <div className="admin-events-container">
          <div className="admin-events-header">
            <h1>Dashboard de Organizador</h1>
          </div>
          <div className="form-error" style={{ margin: '2rem' }}>
            No se pudieron cargar las métricas. Revisa las notificaciones o intente más tarde.
          </div>
        </div>
      </OrganizerSidebar>
    );
  }
  
  // 3. Estado de Éxito
  const { 
    overview = { total_eventos: 0, eventos_realizados: 0, eventos_programados: 0, total_inscripciones: 0, total_asistencias: 0, porcentaje_asistencia: 0 }, 
    satisfaccion_general = null, 
    eventos_populares = [],
    modalidad_distribution = { virtual: 0, presencial: 0, hibrido: 0 }
  } = metrics;

  return (
    <OrganizerSidebar> 
      <div className="admin-events-container"> 
        
        <div className="admin-events-header">
          <h1>Dashboard de Organizador</h1>
          <h3 style={{ color: "#e0d7ff" }}>
            Bienvenido, {user?.nombre || user?.email}
          </h3>
        </div>
        
        <div className="admin-events-panel" style={{ padding: "1.5rem" }}>
          
          <h2 className="panel-subtitle">Resumen General</h2>
          <div className="metrics-grid">
            <StatsCard
              title="Eventos Registrados"
              value={formatNumber(overview.total_eventos)}
              icon={<FaCalendarAlt />}
              color="#7957F2"
            />
            <StatsCard
              title="Eventos Pasados"
              value={formatNumber(overview.eventos_realizados)}
              icon={<FaCalendarCheck />}
              color="#BF2A52"
            />
            <StatsCard
              title="Eventos Próximos"
              value={formatNumber(overview.eventos_programados)}
              icon={<FaClock />}
              color="#2196F3"
            />
            <StatsCard
              title="Total de Inscripciones"
              value={formatNumber(overview.total_inscripciones)}
              icon={<FaUsers />}
              color="#4CAF50"
            />
            <StatsCard
              title="Asistencias Verificadas"
              value={formatNumber(overview.total_asistencias)}
              icon={<FaUserCheck />}
              color="#FFC107"
            />
            <StatsCard
              title="Tasa de Asistencia"
              value={formatPercentage(overview.porcentaje_asistencia)}
              icon={<FaChartBar />}
              color="#A6249D"
            />
            <StatsCard
              title="Satisfacción General"
              value={`${(satisfaccion_general?.promedio_general || 0).toFixed(2)} / 5`}
              icon={<FaStar />}
              color="#00BCD4"
            />
          </div>

          {/* --- Fila de Gráficos (con chart.js) --- */}
          <div className="dashboard-charts-row">
            
            <div className="chart-container">
              <h3>Distribución por Modalidad</h3>
              <GeneralModalityChart stats={modalidad_distribution} />
            </div>
            
            <div className="chart-container">
              <h3>Inscripciones vs. Asistencias</h3>
              <GeneralAttendanceChart stats={overview} />
            </div>
          
          </div>
          
          {/* --- Tabla de Eventos Populares --- */}
          <div className="table-container" style={{ marginTop: '2rem' }}>
            <h2 className="panel-subtitle">Eventos Populares</h2>
            <table className="admin-events-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Modalidad</th>
                  <th>Inscritos</th>
                  <th>Asistentes</th>
                </tr>
              </thead>
              <tbody>
                {eventos_populares.length > 0 ? (
                  eventos_populares.map(evento => (
                    <tr key={evento.id}>
                      <td>{evento.titulo}</td>
                      <td>{new Date(evento.fecha_hora).toLocaleString('es-PE')}</td>
                      <td className="capitalize">{evento.modalidad}</td>
                      <td>{evento.total_inscripciones}</td>
                      <td>{evento.total_asistencias}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No hay eventos para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrganizerSidebar>
  );
}

/**
 * Gráfico de Barras (chart.js) para Inscripciones vs Asistencia
 */
const GeneralAttendanceChart = ({ stats }) => {
  const data = {
    labels: ['Participación'], 
    datasets: [
      {
        label: 'Inscripciones',
        data: [stats?.total_inscripciones || 0],
        backgroundColor: '#4CAF50',
        borderRadius: 4,
      },
      {
        label: 'Asistencias',
        data: [stats?.total_asistencias || 0],
        backgroundColor: '#FFC107',
        borderRadius: 4,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', 
    scales: {
      x: { 
        beginAtZero: true, 
        ticks: { color: '#ccc' },
        grid: { color: '#ffffff20' }
      },
      y: { 
        ticks: { color: '#ccc' },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { color: '#ccc' }
      },
    },
  };
  return (
    <div className="chart-wrapper" style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

/**
 * Gráfico de Pie (chart.js) para Modalidad
 */
const GeneralModalityChart = ({ stats }) => {
  const chartData = [
    stats?.virtual || 0,
    stats?.presencial || 0,
    stats?.hibrido || 0
  ];
  const total = chartData.reduce((a, b) => a + b, 0);

  const data = {
    labels: ['Virtual', 'Presencial', 'Híbrido'],
    datasets: [{
      data: chartData,
      backgroundColor: ['#7957F2', '#2196F3', '#BF2A52'],
      borderColor: '#2a2a3e', 
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { color: '#ccc' } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
            return `${label} ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: '300px' }}>
      {total > 0 ? (
        <Pie data={data} options={options} />
      ) : (
        <p style={{ textAlign: 'center', color: '#ccc', paddingTop: '1rem' }}>No hay datos de modalidad para mostrar.</p>
      )}
    </div>
  );
};