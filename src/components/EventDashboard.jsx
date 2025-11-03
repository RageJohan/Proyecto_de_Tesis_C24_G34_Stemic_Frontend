import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
  getAllEvents,
  getEventMetrics,
  getMyEventsForOrganizer,
} from "../services/api";
import AdminSidebar from "./AdminSidebar";
import OrganizerSidebar from "./OrganizerSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  FaUsers,
  FaUserCheck,
  FaClipboardList,
  FaChartLine,
  FaSmile,
  FaPercentage,
} from "react-icons/fa";
import "../styles/AdminEventsPanel.css";
import "../styles/OrganizerDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const StatsCard = ({ title, value, icon, color }) => (
  <div className="metric-card" style={{ borderLeftColor: color }}>
    <div className="metric-card-info">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value" style={{ color }}>{value}</div>
    </div>
    <div className="metric-card-icon" style={{ color }}>{icon}</div>
  </div>
);

const EventAttendanceChart = ({ overview }) => {
  const data = {
    labels: ["Participación"],
    datasets: [
      {
        label: "Inscripciones",
        data: [overview?.total_inscripciones || 0],
        backgroundColor: "#7957F2",
        borderRadius: 4,
      },
      {
        label: "Asistencias",
        data: [overview?.total_asistencias || 0],
        backgroundColor: "#4CAF50",
        borderRadius: 4,
      },
      {
        label: "Evaluaciones",
        data: [overview?.total_evaluaciones || 0],
        backgroundColor: "#FFC107",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#ccc" },
        grid: { color: "#ffffff20" },
      },
      y: {
        ticks: { color: "#ccc" },
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#ccc" },
      },
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: "300px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const EventTimelineChart = ({ timeline }) => {
  const labels = timeline.map((item) => item.fecha);
  const inscripciones = timeline.map((item) => item.inscripciones || 0);
  const asistencias = timeline.map((item) => item.asistencias || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Inscripciones",
        data: inscripciones,
        borderColor: "#7957F2",
        backgroundColor: "rgba(121, 87, 242, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
      {
        label: "Asistencias",
        data: asistencias,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#ccc" },
        grid: { color: "#ffffff10" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#ccc" },
        grid: { color: "#ffffff10" },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#ccc" },
      },
      tooltip: {
        callbacks: {
          title: (items) => (items?.[0]?.label ? items[0].label : ""),
        },
      },
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: "300px" }}>
      {labels.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p style={{ textAlign: "center", color: "#ccc", paddingTop: "1rem" }}>
          Aún no hay actividad registrada.
        </p>
      )}
    </div>
  );
};

const formatNumber = (num) => (Number(num) || 0).toLocaleString("es-ES");
const formatPercentage = (num) => `${(Number(num) || 0).toFixed(2)}%`;
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "N/A";

export default function EventDashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.rol === "admin";
  const Layout = useMemo(() => (isAdmin ? AdminSidebar : OrganizerSidebar), [isAdmin]);
  const overview = metrics?.overview ?? {};
  const satisfaction = metrics?.satisfaction ?? {};
  const timeline = metrics?.timeline ?? [];
  const recentActivity = metrics?.recent_activity ?? {
    inscripciones: [],
    asistencias: [],
    evaluaciones: [],
  };
  const feedback = metrics?.feedback ?? [];
  const postulaciones = metrics?.postulaciones ?? {
    resumen: {},
    recientes: [],
  };
  const hasEvents = events.length > 0;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const list = await getAllEvents();
        setEvents(list);
        setSelectedEventId((current) => {
          if (!list || list.length === 0) {
            return "";
          }
          if (current && list.some((event) => event.id === current)) {
            return current;
          }
          return list[0].id;
        });
      } catch (err) {
        const message = err.message || "No se pudieron cargar los eventos";
        setError(message);
        showNotification(message, "error");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [isAdmin, showNotification]);

  useEffect(() => {
    if (!selectedEventId) {
      setMetrics(null);
      return;
    }

    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      setError(null);
      try {
        const data = await getEventMetrics(selectedEventId);
        setMetrics(data);
      } catch (err) {
        const message = err.message || "No se pudieron cargar las métricas";
        setError(message);
        showNotification(message, "error");
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [selectedEventId, showNotification]);

  return (
    <Layout>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>Dashboard por Evento</h1>
          {metrics?.event ? (
            <div style={{ color: "#e0d7ff", lineHeight: 1.4 }}>
              <strong>{metrics.event.titulo}</strong>
              <div>
                {new Date(metrics.event.fecha_hora).toLocaleString("es-PE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {metrics.event.modalidad ? ` • ${metrics.event.modalidad.toUpperCase()}` : ""}
                {metrics.event.lugar ? ` • ${metrics.event.lugar}` : ""}
              </div>
              {metrics.event.organizer_nombre && (
                <div>Organizado por: {metrics.event.organizer_nombre}</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="admin-events-panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
              alignItems: "center",
            }}
          >
            <label htmlFor="event-select" style={{ color: "#ccc", fontWeight: 600 }}>
              Selecciona un evento:
            </label>
            <select
              id="event-select"
              disabled={loadingEvents || events.length === 0}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="events-filter-select"
              style={{ minWidth: 240 }}
            >
              {events.length === 0 ? (
                <option value="">No hay eventos disponibles</option>
              ) : (
                events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.titulo} ({new Date(event.fecha_hora).toLocaleDateString("es-PE")})
                  </option>
                ))
              )}
            </select>
            {loadingEvents && <span style={{ color: "#aaa" }}>Cargando eventos...</span>}
          </div>

          {error && (
            <div className="form-error" style={{ marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          {loadingMetrics ? (
            <div className="orgs-loading" style={{ padding: "2rem 0" }}>
              Cargando métricas del evento...
            </div>
          ) : !metrics ? (
            <div className="orgs-empty" style={{ padding: "2rem 0" }}>
              {hasEvents
                ? "Selecciona un evento para ver sus métricas."
                : "No hay eventos disponibles todavía."}
            </div>
          ) : (
            <>
              <h2 className="panel-subtitle">Indicadores Clave</h2>
              <div className="metrics-grid">
                <StatsCard
                  title="Inscripciones"
                  value={formatNumber(overview.total_inscripciones)}
                  icon={<FaUsers />}
                  color="#7957F2"
                />
                <StatsCard
                  title="Asistencias"
                  value={formatNumber(overview.total_asistencias)}
                  icon={<FaUserCheck />}
                  color="#4CAF50"
                />
                <StatsCard
                  title="Evaluaciones"
                  value={formatNumber(overview.total_evaluaciones)}
                  icon={<FaClipboardList />}
                  color="#FFC107"
                />
                <StatsCard
                  title="Tasa de asistencia"
                  value={formatPercentage(overview.porcentaje_asistencia)}
                  icon={<FaChartLine />}
                  color="#2196F3"
                />
                <StatsCard
                  title="Tasa de evaluación"
                  value={formatPercentage(overview.porcentaje_evaluacion)}
                  icon={<FaPercentage />}
                  color="#A6249D"
                />
                <StatsCard
                  title="Satisfacción promedio"
                  value={`${(satisfaction.promedio_general || 0).toFixed(2)} / 5`}
                  icon={<FaSmile />}
                  color="#00BCD4"
                />
                <StatsCard
                  title="Postulaciones"
                  value={formatNumber(postulaciones.resumen?.total)}
                  icon={<FaClipboardList />}
                  color="#22d3ee"
                />
                <StatsCard
                  title="Postulaciones aprobadas"
                  value={formatNumber(postulaciones.resumen?.aprobados)}
                  icon={<FaUserCheck />}
                  color="#34d399"
                />
              </div>

              {postulaciones.resumen?.total ? (
                <div className="postulation-status-grid">
                  {[
                    { label: "Pendientes", value: postulaciones.resumen.pendientes, color: "#fbbf24" },
                    { label: "En revisión", value: postulaciones.resumen.en_revision, color: "#38bdf8" },
                    { label: "Preseleccionadas", value: postulaciones.resumen.preseleccionados, color: "#a855f7" },
                    { label: "Aprobadas", value: postulaciones.resumen.aprobados, color: "#22c55e" },
                    { label: "Rechazadas", value: postulaciones.resumen.rechazados, color: "#ef4444" },
                  ].map((item) => (
                    <div key={item.label} className="postulation-status-card">
                      <span className="postulation-status-label" style={{ color: item.color }}>
                        {item.label}
                      </span>
                      <span className="postulation-status-value">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="dashboard-charts-row">
                <div className="chart-container">
                  <h3>Inscripciones vs. Asistencias</h3>
                  <EventAttendanceChart overview={overview} />
                </div>
                <div className="chart-container">
                  <h3>Evolución diaria</h3>
                  <EventTimelineChart timeline={timeline} />
                </div>
              </div>

              <div className="table-container" style={{ marginTop: "2rem" }}>
                <h2 className="panel-subtitle">Actividad reciente</h2>
                <div
                  style={{
                    display: "grid",
                    gap: "1.5rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  }}
                >
                  <div className="table-container" style={{ marginTop: 0 }}>
                    <h3 style={{ color: "#e0d7ff", marginBottom: "0.75rem" }}>Inscripciones</h3>
                    {recentActivity.inscripciones.length > 0 ? (
                      <table className="admin-events-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.inscripciones.map((item) => (
                            <tr key={item.id}>
                              <td>{item.nombre || "N/A"}</td>
                              <td>{item.correo || "N/A"}</td>
                              <td>{formatDateTime(item.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="orgs-empty" style={{ padding: "1rem 0" }}>
                        Sin inscripciones recientes.
                      </div>
                    )}
                  </div>

                  <div className="table-container" style={{ marginTop: 0 }}>
                    <h3 style={{ color: "#e0d7ff", marginBottom: "0.75rem" }}>Asistencias</h3>
                    {recentActivity.asistencias.length > 0 ? (
                      <table className="admin-events-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.asistencias.map((item) => (
                            <tr key={item.id}>
                              <td>{item.nombre || "N/A"}</td>
                              <td>{item.correo || "N/A"}</td>
                              <td>{formatDateTime(item.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="orgs-empty" style={{ padding: "1rem 0" }}>
                        Sin asistencias registradas aún.
                      </div>
                    )}
                  </div>

                  <div className="table-container" style={{ marginTop: 0 }}>
                    <h3 style={{ color: "#e0d7ff", marginBottom: "0.75rem" }}>Evaluaciones</h3>
                    {recentActivity.evaluaciones.length > 0 ? (
                      <table className="admin-events-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Calificación</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.evaluaciones.map((item) => (
                            <tr key={item.id}>
                              <td>{item.nombre || "N/A"}</td>
                              <td>{item.calificacion_general ? item.calificacion_general.toFixed(1) : "N/A"}</td>
                              <td>{formatDateTime(item.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="orgs-empty" style={{ padding: "1rem 0" }}>
                    <div className="table-container" style={{ marginTop: 0 }}>
                      <h3 style={{ color: "#e0d7ff", marginBottom: "0.75rem" }}>Postulaciones</h3>
                      {postulaciones.recientes.length > 0 ? (
                        <table className="admin-events-table">
                          <thead>
                            <tr>
                              <th>Postulante</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {postulaciones.recientes.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span>{item.nombre}</span>
                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{item.correo}</span>
                                  </div>
                                </td>
                                <td style={{ textTransform: "capitalize" }}>{item.estado.replace(/_/g, " ")}</td>
                                <td>{formatDateTime(item.fecha_postulacion)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="table-empty">Sin postulaciones recientes.</div>
                      )}
                    </div>
                        Sin evaluaciones recientes.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="table-container" style={{ marginTop: "2rem" }}>
                <h2 className="panel-subtitle">Retroalimentación destacada</h2>
                {feedback.length > 0 ? (
                  <table className="admin-events-table">
                    <thead>
                      <tr>
                        <th>Participante</th>
                        <th>Fecha</th>
                        <th>Lo que más gustó</th>
                        <th>Aspectos a mejorar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre || "N/A"}</td>
                          <td>{formatDateTime(item.fecha)}</td>
                          <td>{item.lo_que_mas_gusto || "-"}</td>
                          <td>{item.aspectos_mejorar || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="orgs-empty" style={{ padding: "1rem 0" }}>
                    Aún no hay retroalimentación textual para mostrar.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
