import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getAdminPostulations, approvePostulation, rejectPostulation } from "../services/api";
import ReactModal from "react-modal";
import "../styles/AdminPostulationsPanel.css";
import "../styles/MotivationModal.css";

// Configurar el elemento principal de la aplicación para ReactModal
ReactModal.setAppElement("#root");

// Iconos SVG reutilizables
const Icons = {
  Search: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  Check: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  X: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Eye: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  FileText: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

// Badge de estado modernizado
function EstadoBadge({ estado }) {
  const statusStyles = {
    aprobada: { class: 'status-success', label: 'Aprobada' },
    rechazada: { class: 'status-danger', label: 'Rechazada' },
    pendiente: { class: 'status-warning', label: 'Pendiente' }
  };

  const style = statusStyles[estado] || statusStyles.pendiente;

  return (
    <span className={`status-badge ${style.class}`}>
      <span className="status-dot"></span>
      {style.label}
    </span>
  );
}

export default function AdminPostulationsPanel() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ estado: "", carrera: "", page: 1, limit: 10 });
  const [total, setTotal] = useState(0);
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  
  // Estado para controlar loading de acciones individuales
  const [actionLoading, setActionLoading] = useState(null); 

  useEffect(() => {
    setLoading(true);
    getAdminPostulations(filtros)
      .then((res) => {
        setPostulaciones(res.data || []);
        setTotal(res.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filtros]);

  const handleAprobar = async (id) => {
    setActionLoading(id);
    try {
      await approvePostulation(id);
      setPostulaciones((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 'aprobada' } : p))
      );
    } catch (error) {
      console.error('Error al aprobar la postulación:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async (id) => {
    setActionLoading(id);
    try {
      await rejectPostulation(id);
      setPostulaciones((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 'rechazada' } : p))
      );
    } catch (error) {
      console.error('Error al rechazar la postulación:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openMotivationModal = (motivation) => {
    setSelectedMotivation(motivation);
  };

  const closeMotivationModal = () => {
    setSelectedMotivation(null);
  };

  return (
    <AdminSidebar>
      <div className="admin-panel-wrapper">
        
        {/* HEADER */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Postulaciones LEAD</h1>
            <p className="admin-subtitle">Gestiona las solicitudes de ingreso al programa de liderazgo.</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="admin-filters-bar">
          <div className="search-group">
            <Icons.Search />
            <input
              type="text"
              placeholder="Buscar por carrera o especialidad..."
              value={filtros.carrera}
              onChange={e => setFiltros(f => ({ ...f, carrera: e.target.value, page: 1 }))}
            />
          </div>
          
          <select 
            className="filter-select"
            value={filtros.estado} 
            onChange={e => setFiltros(f => ({ ...f, estado: e.target.value, page: 1 }))}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>

        {/* TABLA */}
        <div className="admin-content-card">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <span>Cargando postulaciones...</span>
            </div>
          ) : postulaciones.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">📝</div>
              <h3>No hay postulaciones</h3>
              <p>Aún no se han recibido solicitudes con estos filtros.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Postulante</th>
                    <th>Carrera</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulaciones.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-info">
                          <span className="table-name">{p.usuario?.nombre || 'Desconocido'}</span>
                          <span className="table-desc">{p.usuario?.correo || ''}</span>
                        </div>
                      </td>
                      <td>{p.carrera_especialidad}</td>
                      <td><EstadoBadge estado={p.estado} /></td>
                      <td>
                        <div className="table-date">
                          {p.fecha_postulacion
                            ? new Date(p.fecha_postulacion).toLocaleDateString()
                            : p.created_at
                              ? new Date(p.created_at).toLocaleDateString()
                              : ''
                          }
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {/* Botón Ver Motivación (Siempre visible) */}
                          <button 
                            onClick={() => openMotivationModal(p.motivacion)} 
                            className="btn-icon btn-view"
                            title="Ver carta de motivación"
                          >
                            <Icons.FileText />
                          </button>

                          {/* Acciones solo si está pendiente */}
                          {p.estado === "pendiente" && (
                            <>
                              <button 
                                onClick={() => handleAprobar(p.id)} 
                                className="btn-icon btn-approve"
                                title="Aprobar postulación"
                                disabled={actionLoading === p.id}
                              >
                                {actionLoading === p.id ? <span className="mini-spinner"></span> : <Icons.Check />}
                              </button>
                              <button 
                                onClick={() => handleRechazar(p.id)} 
                                className="btn-icon btn-reject"
                                title="Rechazar postulación"
                                disabled={actionLoading === p.id}
                              >
                                {actionLoading === p.id ? <span className="mini-spinner"></span> : <Icons.X />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINACIÓN */}
          <div className="admin-pagination">
            <span className="pagination-info">
              Total: {total} registros
            </span>
            <div className="pagination-controls">
              <button 
                disabled={filtros.page === 1} 
                onClick={() => setFiltros(f => ({ ...f, page: f.page - 1 }))}
              >
                Anterior
              </button>
              <span className="page-number">{filtros.page}</span>
              <button 
                disabled={postulaciones.length < filtros.limit} 
                onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MOTIVACIÓN */}
      <ReactModal
        isOpen={!!selectedMotivation}
        onRequestClose={closeMotivationModal}
        contentLabel="Motivación del Postulante"
        className="motivation-modal-content"
        overlayClassName="attendance-qr-modal-overlay" // Reutilizamos overlay oscuro
      >
        <div className="modal-header">
          <h2>Carta de Motivación</h2>
          <button onClick={closeMotivationModal} className="qr-close-btn">×</button>
        </div>
        <div className="modal-body">
          <p>{selectedMotivation}</p>
        </div>
        <div className="modal-footer">
          <button onClick={closeMotivationModal} className="btn-secondary-action">Cerrar</button>
        </div>
      </ReactModal>
    </AdminSidebar>
  );
}