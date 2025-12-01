import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  getAdminAlliances,
  activateAlliance,
  deactivateAlliance,
  deleteAlliance
} from "../services/api";
import AdminAllianceForm from "./AdminAllianceForm";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/AdminAlliancesPanel.css";

// Iconos SVG reutilizables
const Icons = {
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  Edit: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Eye: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  Link: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
};

function EstadoBadge({ activo }) {
  return (
    <span className={`status-badge ${activo ? 'active' : 'inactive'}`}>
      <span className="status-dot"></span>
      {activo ? "Visible" : "Oculto"}
    </span>
  );
}

export default function AdminAlliancesPanel() {
  const [alianzas, setAlianzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ activo: "", nombre: "", descripcion: "", page: 1, limit: 10 });
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingAllianceId, setEditingAllianceId] = useState(null);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null,
    confirmText: '',
    confirmButtonClass: '',
    onConfirm: null,
    icon: null
  });

  const refresh = () => setFiltros(f => ({ ...f }));

  useEffect(() => {
    setLoading(true);
    getAdminAlliances(filtros)
      .then((res) => {
        setAlianzas(res.data || []);
        setTotal(res.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filtros]);

  const handleActivar = async (alianza) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hacer visible alianza',
      message: `¿Mostrar "${alianza.nombre}" públicamente?`,
      details: ['La alianza aparecerá en la sección de "Nuestras Alianzas" para todos los usuarios.'],
      confirmText: 'Activar',
      confirmButtonClass: 'btn-confirm-success',
      onConfirm: async () => {
        await activateAlliance(alianza.id);
        refresh();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      icon: '👁️'
    });
  };

  const handleDesactivar = async (alianza) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ocultar alianza',
      message: `¿Ocultar "${alianza.nombre}" del público?`,
      details: ['La alianza dejará de ser visible, pero no se eliminará del sistema.'],
      confirmText: 'Ocultar',
      confirmButtonClass: 'btn-confirm-warning',
      onConfirm: async () => {
        await deactivateAlliance(alianza.id);
        refresh();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      icon: '🔒'
    });
  };

  const handleEliminar = async (alianza) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Alianza',
      message: `¿Eliminar "${alianza.nombre}" permanentemente?`,
      details: ['Esta acción es irreversible y eliminará el logo asociado.'],
      confirmText: 'Eliminar',
      confirmButtonClass: 'btn-confirm-danger',
      onConfirm: async () => {
        await deleteAlliance(alianza.id);
        refresh();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      icon: '🗑️'
    });
  };

  return (
    <AdminSidebar>
      <div className="admin-panel-wrapper">
        
        {/* HEADER & TOOLBAR */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Gestión de Alianzas</h1>
            <p className="admin-subtitle">Administra las organizaciones y partners visibles en la plataforma.</p>
          </div>
          <button className="btn-primary-create" onClick={() => setShowForm(true)}>
            <Icons.Plus />
            Nueva Alianza
          </button>
        </div>

        {/* FILTROS */}
        <div className="admin-filters-bar">
          <div className="search-group">
            <Icons.Search />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtros.nombre}
              onChange={e => setFiltros(f => ({ ...f, nombre: e.target.value, page: 1 }))}
            />
          </div>
          
          <select 
            className="filter-select"
            value={filtros.activo} 
            onChange={e => setFiltros(f => ({ ...f, activo: e.target.value, page: 1 }))}
          >
            <option value="">Todos los estados</option>
            <option value="true">Visibles</option>
            <option value="false">Ocultos</option>
          </select>
        </div>

        {/* LISTA / TABLA */}
        <div className="admin-content-card">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <span>Cargando alianzas...</span>
            </div>
          ) : alianzas.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">🤝</div>
              <h3>No hay alianzas encontradas</h3>
              <p>Intenta ajustar los filtros o crea una nueva alianza.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Organización</th>
                    <th>Estado</th>
                    <th>Web</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alianzas.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="table-logo-box">
                          <img src={a.logo_url || '/placeholder.png'} alt={a.nombre} />
                        </div>
                      </td>
                      <td>
                        <div className="table-info">
                          <span className="table-name">{a.nombre}</span>
                          <span className="table-desc" title={a.descripcion}>
                            {a.descripcion ? (a.descripcion.length > 50 ? a.descripcion.substring(0, 50) + '...' : a.descripcion) : 'Sin descripción'}
                          </span>
                        </div>
                      </td>
                      <td><EstadoBadge activo={a.activo} /></td>
                      <td>
                        {a.sitio_web ? (
                          <a href={a.sitio_web} target="_blank" rel="noreferrer" className="table-link">
                            <Icons.Link /> Visitar
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => { setEditingAllianceId(a.id); setShowForm(true); }} 
                            className="btn-icon btn-edit"
                            title="Editar"
                          >
                            <Icons.Edit />
                          </button>
                          
                          {a.activo ? (
                            <button 
                              onClick={() => handleDesactivar(a)} 
                              className="btn-icon btn-hide"
                              title="Ocultar"
                            >
                              <Icons.EyeOff />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivar(a)} 
                              className="btn-icon btn-show"
                              title="Mostrar"
                            >
                              <Icons.Eye />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleEliminar(a)} 
                            className="btn-icon btn-delete"
                            title="Eliminar"
                          >
                            <Icons.Trash />
                          </button>
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
              Mostrando {alianzas.length} de {total} resultados
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
                disabled={alianzas.length < filtros.limit} 
                onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* MODAL FORMULARIO */}
        {showForm && (
          <AdminAllianceForm
            allianceId={editingAllianceId}
            onSuccess={() => {
              setShowForm(false);
              setEditingAllianceId(null);
              refresh();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingAllianceId(null);
            }}
          />
        )}

        {/* MODAL CONFIRMACIÓN */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          details={confirmDialog.details}
          confirmText={confirmDialog.confirmText}
          confirmButtonClass={confirmDialog.confirmButtonClass}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          icon={confirmDialog.icon}
        />
      </div>
    </AdminSidebar>
  );
}