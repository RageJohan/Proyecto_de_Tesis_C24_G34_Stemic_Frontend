import React, { useState } from "react";
import { createAlliance } from "../services/api";
import "../styles/AdminAllianceForm.css";

export default function AdminAllianceForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    logo_url: "",
    sitio_web: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createAlliance(form);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Error al crear la alianza");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alliance-form-modal">
      <form className="admin-alliance-form" onSubmit={handleSubmit}>
        <h3>Crear nueva alianza</h3>
        <label>
          Nombre:
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Descripción:
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </label>
        <label>
          Logo URL:
          <input name="logo_url" value={form.logo_url} onChange={handleChange} />
        </label>
        <label>
          Sitio web:
          <input name="sitio_web" value={form.sitio_web} onChange={handleChange} />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-crear">
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
