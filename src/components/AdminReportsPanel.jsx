import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getAllEvents, getParticipationData, getSatisfactionData, getReportHistory, getReportFile } from "../services/api";
import { useLoader } from "../context/LoaderContext";
import "../styles/AdminEventsPanel.css";

function EventFilter({ eventId, setEventId, events }) {
  return (
    <select
      value={eventId}
      onChange={(e) => setEventId(e.target.value)}
      className="events-filter-select"
      style={{ minWidth: 200, marginBottom: "1.5rem" }}
    >
      <option value="">Selecciona un evento</option>
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.titulo} ({new Date(event.fecha_hora).toLocaleDateString()})
        </option>
      ))}
    </select>
  );
}

export default function AdminReportsPanel() {
  const { withLoader, isLoading } = useLoader();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [reportType, setReportType] = useState("participation");
  const [data, setData] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [reportError, setReportError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  const previewLoading = isLoading("reportPreview");

  useEffect(() => {
    withLoader(
      async () => {
        const [allEvents, historyData] = await Promise.all([
          getAllEvents().catch(() => []),
          getReportHistory().catch(() => []),
        ]);
        return { allEvents, historyData };
      },
      { message: "Cargando datos iniciales..." }
    )
      .then(({ allEvents, historyData }) => {
        setEvents(allEvents);
        const allEventIds = allEvents.map((e) => e.id);
        const filteredHistory = historyData.filter(
          (h) => h.filters?.evento_id && allEventIds.includes(h.filters.evento_id)
        );
        setReportHistory(filteredHistory);
      })
      .catch(() => setHistoryError("Error al cargar datos iniciales."));
  }, [withLoader]);

  useEffect(() => {
    setReportError(null);
    setData(null);

    if (eventId && reportType) {
      withLoader(
        async () => {
          const apiCall = reportType === "participation" ? getParticipationData : getSatisfactionData;
          const result = await apiCall({ evento_id: eventId });
          return result.data;
        },
        { sectionId: "reportPreview", message: "Cargando vista previa..." }
      )
        .then((reportData) => {
          setData(reportData);
        })
        .catch((err) => setReportError(err.message || "Error al obtener datos"));
    }
  }, [eventId, reportType, withLoader]);

  const handleDownload = async (format) => {
    if (!eventId) return;

    try {
      withLoader(async () => {
        const blob = await getReportFile({
          reportType,
          format,
          filters: { evento_id: eventId },
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const extension = format === "excel" ? "xlsx" : format;
        a.download = `reporte_${reportType}_${format}.${extension}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }, { message: "Descargando reporte..." });
    } catch (error) {
      setReportError(error.message || "Error al descargar el reporte");
    }
  };

  return (
    <AdminSidebar>
      <div className="admin-events-container">
        <div className="admin-events-header">
          <h1>Reportes del Sistema</h1>
        </div>
        <div className="admin-events-panel">
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
              alignItems: "center",
            }}
          >
            <EventFilter events={events} eventId={eventId} setEventId={setEventId} />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="events-filter-select"
              style={{ minWidth: 150 }}
            >
              <option value="participation">Participación</option>
              <option value="satisfaction">Satisfacción</option>
            </select>
          </div>

          {reportError && (
            <div className="form-error" style={{ marginBottom: "1.5rem" }}>
              {reportError}
            </div>
          )}

          <h2 className="panel-subtitle">
            Vista Previa - {reportType === "participation" ? "Participación" : "Satisfacción"}
          </h2>
          <div className="admin-events-table-wrap">
            {previewLoading ? (
              <div className="orgs-loading">Cargando vista previa...</div>
            ) : data && data.length > 0 ? (
              <table className="admin-events-table">
                <thead>
                  <tr>
                    <th>{reportType === "participation" ? "Nombre" : "Usuario"}</th>
                    <th>{reportType === "participation" ? "Correo" : "Cal. General"}</th>
                    <th>{reportType === "participation" ? "Fecha Insc." : "Lo que más gustó"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {reportType === "participation" ? (
                        <>
                          <td>{row.nombre_completo || "N/A"}</td>
                          <td>{row.correo || "N/A"}</td>
                          <td>{new Date(row.fecha_inscripcion).toLocaleDateString()}</td>
                        </>
                      ) : (
                        <>
                          <td>{row.nombre_completo || "N/A"}</td>
                          <td>{row.calificacion_general || "N/A"}</td>
                          <td>{row.lo_que_mas_gusto || "N/A"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  {data.length > 5 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        ... y {data.length - 5} más.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="orgs-empty" style={{ padding: "2rem 0" }}>
                {eventId
                  ? `No hay datos de ${reportType} para este evento.`
                  : "Selecciona un evento para ver la vista previa."}
              </div>
            )}
          </div>

          <h2 className="panel-subtitle" style={{ marginTop: "2.5rem" }}>
            Generar y Descargar Reporte
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              className="admin-events-btn edit"
              disabled={!eventId || !data || data.length === 0 || previewLoading}
              onClick={() => handleDownload("excel")}
            >
              <i className="fas fa-file-excel"></i> Exportar a Excel
            </button>
            <button
              className="admin-events-btn delete"
              disabled={!eventId || !data || data.length === 0 || previewLoading}
              onClick={() => handleDownload("pdf")}
            >
              <i className="fas fa-file-pdf"></i> Exportar a PDF
            </button>
          </div>

          <h2 className="panel-subtitle" style={{ marginTop: "2.5rem" }}>
            Historial de Generación
          </h2>
          {historyError && <div className="form-error">{historyError}</div>}
          <div className="admin-events-table-wrap">
            {reportHistory.length > 0 ? (
              <table className="admin-events-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Formato</th>
                    <th>Estado</th>
                    <th>Evento</th>
                    <th>Generado en</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.slice(0, 5).map((history, index) => (
                    <tr key={index}>
                      <td>{history.report_type}</td>
                      <td>{history.report_format}</td>
                      <td>{history.status}</td>
                      <td>{events.find((e) => e.id === history.filters?.evento_id)?.titulo || "N/A"}</td>
                      <td>{new Date(history.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="orgs-empty" style={{ padding: "1rem 0" }}>
                No hay historial de reportes disponibles.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
