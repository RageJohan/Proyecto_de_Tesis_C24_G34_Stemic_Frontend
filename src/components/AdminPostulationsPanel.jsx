import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getAdminPostulations, approvePostulation, rejectPostulation } from "../services/api";
import "../styles/AdminPostulationsPanel.css";

function EstadoBadge({ estado }) {
  const color =
    estado === "aprobada"
      ? "#4CAF50"
      : estado === "rechazada"
      ? "#F44336"
      : "#FFC107";
  return (
    <span style={{
      background: color,
      color: "#fff",
      borderRadius: 8,
      padding: "2px 10px",
      fontWeight: 600,
      fontSize: 13,
    }}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
  );
}

export default function AdminPostulationsPanel() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ estado: "", carrera: "", page: 1, limit: 10 });
  const [total, setTotal] = useState(0);

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
    await approvePostulation(id);
    setFiltros({ ...filtros }); // Refresca
  };
  const handleRechazar = async (id) => {
    await rejectPostulation(id);
    setFiltros({ ...filtros });
  };

  return (
    <AdminSidebar>
      <div className="admin-post-container">
        <div className="admin-post-header">
          <h1>Postulaciones</h1>
        </div>
        <div className="admin-post-panel">
          <div className="admin-post-filtros">
            <select value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value, page: 1 }))}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
            <input
              type="text"
              placeholder="Carrera/especialidad"
              value={filtros.carrera}
              onChange={e => setFiltros(f => ({ ...f, carrera: e.target.value, page: 1 }))}
            />
          </div>
          <div className="admin-post-table-wrap">
            <table className="admin-post-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Carrera</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}>Cargando...</td></tr>
              ) : postulaciones.length === 0 ? (
                <tr><td colSpan={6}>No hay postulaciones</td></tr>
              ) : (
                postulaciones.map((p) => (
                  <tr key={p.id}>
                    <td>{p.usuario?.nombre || ''}</td>
                    <td>{p.usuario?.correo || ''}</td>
                    <td>{p.carrera_especialidad}</td>
                    <td><EstadoBadge estado={p.estado} /></td>
                    <td>{
                      p.fecha_postulacion
                        ? new Date(p.fecha_postulacion).toLocaleDateString()
                        : p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : ''
                    }</td>
                    <td>
                      {p.estado === "pendiente" && (
                        <>
                          <button onClick={() => handleAprobar(p.id)} className="btn-aprobar">Aprobar</button>
                          <button onClick={() => handleRechazar(p.id)} className="btn-rechazar">Rechazar</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          <div className="admin-post-paginacion">
            <button disabled={filtros.page === 1} onClick={() => setFiltros(f => ({ ...f, page: f.page - 1 }))}>
              Anterior
            </button>
            <span>Página {filtros.page}</span>
            <button disabled={postulaciones.length < filtros.limit} onClick={() => setFiltros(f => ({ ...f, page: f.page + 1 }))}>
              Siguiente
            </button>
            <span>Total: {total}</span>
          </div>
      </div>
      </div>
    </AdminSidebar>
  );
}
