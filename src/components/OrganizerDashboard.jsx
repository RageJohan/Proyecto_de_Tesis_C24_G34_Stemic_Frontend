/**
 * @file src/components/OrganizerDashboard.jsx
 * @description Panel principal para el rol de Organizador.
 * Muestra métricas clave, gráficos de participación y actividad reciente.
 * @requires react
 * @requires recharts
 * @requires ./OrganizerSidebar
 * @requires ../context/AuthContext
 * @requires ../styles/OrganizerDashboard.css
 */

import React from 'react';
import OrganizerSidebar from './OrganizerSidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/OrganizerDashboard.css'; // Importamos los nuevos estilos
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// --- Datos de ejemplo (reemplazar con llamadas a la API) ---

// Datos para el gráfico de barras (Participación por Evento)
const participationData = [
  { name: 'Evento A', participantes: 45, maximo: 100 },
  { name: 'Evento B', participantes: 89, maximo: 100 },
  { name: 'Evento C', participantes: 67, maximo: 80 },
  { name: 'Evento D', participantes: 120, maximo: 120 },
  { name: 'Evento E', participantes: 34, maximo: 50 },
];

// Datos para el gráfico de torta (Categorías de Eventos)
const categoryData = [
  { name: 'Talleres', value: 4 },
  { name: 'Conferencias', value: 3 },
  { name: 'Webinars', value: 5 },
  { name: 'Hackathons', value: 1 },
];
const COLORS = ['#7957F2', '#A6249D', '#BF2A52', '#D93240'];

// Datos para la tabla de actividad reciente
const recentActivity = [
  { id: 1, type: 'Nuevo Evento', description: 'Se creó "Taller de IA".', time: 'hace 2h' },
  { id: 2, type: 'Inscripción', description: 'Usuario X se unió a "Taller de IA".', time: 'hace 3h' },
  { id: 3, type: 'Reporte', description: 'Se generó reporte de "Evento B".', time: 'hace 1d' },
  { id: 4, type: 'Inscripción', description: 'Usuario Y se unió a "Taller de IA".', time: 'hace 2d' },
];

// --------------------------------------------------------

/**
 * Componente StatCard
 * Tarjeta individual para mostrar una métrica clave.
 * @param {object} props
 * @param {string} props.title - Título de la métrica (ej. "Total Eventos")
 * @param {string} props.value - El valor de la métrica (ej. "12")
 * @param {string} [props.subtitle] - (Opcional) Contexto de la métrica (ej. "+2 este mes")
 */
const StatCard = ({ title, value, subtitle }) => (
  <div className="stat-card">
    <div className="stat-card-title">{title}</div>
    <div className="stat-card-value">{value}</div>
    {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
  </div>
);

/**
 * Componente OrganizerDashboard
 * Vista principal del panel de organizador.
 */
export default function OrganizerDashboard() {
  const { user } = useAuth(); // Obtenemos el usuario para el saludo

  // TODO: Reemplazar 'user.nombre' si el nombre está en 'user.profile.nombre'
  const userName = user?.nombre || 'Organizador';

  return (
    <OrganizerSidebar>
      <div className="dashboard-container">
        
        {/* --- Encabezado --- */}
        <header className="dashboard-header">
          <h1>¡Hola de nuevo, {userName}!</h1>
          <p>Aquí tienes un resumen de la actividad de tus eventos.</p>
        </header>

        {/* --- Grid de Tarjetas de Estadísticas --- */}
        <section className="stat-cards-grid">
          {/* TODO: Reemplazar 'value' con datos reales de la API (endpoints de dashboard) */}
          <StatCard title="Eventos Creados" value="12" subtitle="2 activos" />
          <StatCard title="Participantes Totales" value="1,284" subtitle="56 inscritos hoy" />
          <StatCard title="Próximos Eventos" value="3" subtitle="En los siguientes 30 días" />
          <StatCard title="Tasa de Asistencia" value="82%" subtitle="Promedio de todos los eventos" />
        </section>

        {/* --- Grid de Gráficos --- */}
        <section className="charts-grid">
          
          {/* Gráfico Principal (Barras) */}
          <div className="chart-wrapper">
            <h3>Participación por Evento (Últimos 5)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={participationData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 50, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                  cursor={{ fill: 'rgba(121, 87, 242, 0.2)' }}
                />
                <Legend />
                <Bar dataKey="participantes" fill="#7957F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Secundario (Torta) */}
          <div className="chart-wrapper">
            <h3>Tipos de Eventos</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 50, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* --- Sección de Actividad Reciente --- */}
        <section className="recent-activity-wrapper">
          <h3>Actividad Reciente</h3>
          <table className="recent-activity-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: Reemplazar con datos reales de la API */}
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.type}</td>
                  <td>{activity.description}</td>
                  <td>{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </OrganizerSidebar>
  );
}