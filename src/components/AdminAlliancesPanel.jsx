import React, { useEffect, useState } from "react";
import {
  getAdminAlliances,
  activateAlliance,
  deactivateAlliance,
  deleteAlliance
} from "../services/api";
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

  useEffect(() => {
    setLoading(true);
    getAdminAlliances(filtros)
      .then((res) => {
        setAlianzas(res.data || []);
        setTotal(res.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filtros]);

  const handleActivar = async (id) => {
    await activateAlliance(id);
    setFiltros({ ...filtros });
  };
  const handleDesactivar = async (id) => {
    await deactivateAlliance(id);
    setFiltros({ ...filtros });
  };
  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar esta alianza permanentemente?")) {
      await deleteAlliance(id);
      setFiltros({ ...filtros });
    }
  };

  return (
    <div className="admin-alliances-panel">
      <h2>Alianzas - Admin</h2>
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
                    {a.activo ? (
                      <button onClick={() => handleDesactivar(a.id)} className="btn-desactivar">Desactivar</button>
                    ) : (
                      <button onClick={() => handleActivar(a.id)} className="btn-activar">Activar</button>
                    )}
                    <button onClick={() => handleEliminar(a.id)} className="btn-eliminar">Eliminar</button>
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
      <div style={{textAlign: "right", marginTop: 16}}>
        <button className="btn-crear">Crear nueva alianza</button>
      </div>
    </div>
  );
}
