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

function EstadoBadge({ activo }) {
  const color = activo ? "#4CAF50" : "#F44336";
  return (
    <span style={{
      background: color,
      color: "#fff",
      borderRadius: 8,
      padding: "2px 10px",
      fontWeight: 600,
      fontSize: 13,
    }}>{activo ? "Activa" : "Inactiva"}</span>
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
      title: 'Activar Alianza',
      message: `¿Estás seguro de que deseas activar la alianza "${alianza.nombre}"?`,
      details: [
        'La alianza será visible públicamente',
        'Se podrá acceder a su información desde la página principal',
        'Los usuarios podrán ver los detalles de la alianza'
      ],
      confirmText: 'Activar',
      confirmButtonClass: 'btn-confirmar',
      onConfirm: async () => {
        await activateAlliance(alianza.id);
        refresh();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      icon: '✨'
    });
  };

  const handleDesactivar = async (alianza) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Desactivar Alianza',
      message: `¿Estás seguro de que deseas desactivar la alianza "${alianza.nombre}"?`,
      details: [
        'La alianza dejará de ser visible públicamente',
        'Se mantendrá en el sistema pero no será accesible',
        'Podrás reactivarla en cualquier momento'
      ],
      confirmText: 'Desactivar',
      confirmButtonClass: 'btn-desactivar',
      onConfirm: async () => {
        await deactivateAlliance(alianza.id);
        refresh();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      icon: '⚠️'
    });
  };

  const handleEliminar = async (alianza) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Alianza',
      message: `¿Estás seguro de que deseas eliminar permanentemente la alianza "${alianza.nombre}"?`,
      details: [
        'Esta acción no se puede deshacer',
        'Se perderá toda la información asociada',
        'El logo y recursos asociados serán eliminados',
        'Se eliminarán las referencias a esta alianza en el sistema'
      ],
      confirmText: 'Eliminar Permanentemente',
      confirmButtonClass: 'btn-eliminar',
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
      <div className="admin-alliances-container">
        <div className="admin-alliances-header">
          <h1>Alianzas - Admin</h1>
        </div>
        <div className="admin-alliances-panel">
          <div className="admin-alliances-filtros">
            <select value={filtros.activo} onChange={e => setFiltros(f => ({ ...f, activo: e.target.value, page: 1 }))}>
              <option value="">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
            <input
              type="text"
              placeholder="Nombre"
              value={filtros.nombre}
              onChange={e => setFiltros(f => ({ ...f, nombre: e.target.value, page: 1 }))}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={filtros.descripcion}
              onChange={e => setFiltros(f => ({ ...f, descripcion: e.target.value, page: 1 }))}
            />
        </div>
        <div className="admin-alliances-table-wrap">
          <table className="admin-alliances-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Cargando...</td></tr>
              ) : alianzas.length === 0 ? (
                <tr><td colSpan={4}>No hay alianzas</td></tr>
              ) : (
                alianzas.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td>
                    <td>{a.descripcion}</td>
                    <td><EstadoBadge activo={a.activo} /></td>
                    <td>
                      <button 
                        onClick={() => {
                          setEditingAllianceId(a.id);
                          setShowForm(true);
                        }} 
                        className="btn-editar"
                      >
                        Editar
                      </button>
                      {a.activo ? (
                        <button onClick={() => handleDesactivar(a)} className="btn-desactivar">Desactivar</button>
                      ) : (
                        <button onClick={() => handleActivar(a)} className="btn-activar">Activar</button>
                      )}
                      <button onClick={() => handleEliminar(a)} className="btn-eliminar">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-alliances-paginacion">
          <button disabled={filtros.page === 1} onClick={() => setFiltros(f => ({ ...f, page: f.page - 1 }))}>
            Anterior
          </button>
          <span>Página {filtros.page}</span>
          <button disabled={alianzas.length < filtros.limit} onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}>
            Siguiente
          </button>
          <span>Total: {total}</span>
        </div>
        <button className="btn-crear" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i>
          Crear nueva alianza
        </button>
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
      </div>
    </div>
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
    </AdminSidebar>
  );
}
