import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/api";
import "../styles/EventCreateModal.css";
import AdminSidebar from "./AdminSidebar";

export default function EventCreateView() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_aplicacion_prioritaria: "",
    fecha_aplicacion_general: "",
    duracion: "",
    correo_contacto: "",
    informacion_adicional: "",
    skills: [],
    tags: [],
    modalidad: "virtual",
    lugar: "",
    fecha_hora: "",
    requiere_postulacion: false,
    imagen: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm((f) => ({ ...f, imagen: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleArrayChange(name, value) {
    setForm((f) => ({ ...f, [name]: value.split(",").map((v) => v.trim()).filter(Boolean) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "imagen" && value) {
          formData.append("imagen", value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });
      await createEvent(formData);
  navigate("/admin-events");
    } catch (err) {
      setError(err.message || "Error al crear evento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminSidebar>
      <div className="modal-overlay" style={{position:'static',background:'none',padding:0}}>
        <div className="modal-content" style={{maxWidth:800,margin:'0 auto'}}>
        <h2>Crear nuevo evento</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <label>Título*<input name="titulo" value={form.titulo} onChange={handleChange} required minLength={3} /></label>
          <label>Descripción*<textarea name="descripcion" value={form.descripcion} onChange={handleChange} required minLength={10} /></label>
          <label>Fecha aplicación prioritaria*<input name="fecha_aplicacion_prioritaria" type="date" value={form.fecha_aplicacion_prioritaria} onChange={handleChange} required /></label>
          <label>Fecha aplicación general*<input name="fecha_aplicacion_general" type="date" value={form.fecha_aplicacion_general} onChange={handleChange} required /></label>
          <label>Duración*<input name="duracion" type="text" placeholder="HH:MM:SS" value={form.duracion} onChange={handleChange} required pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" /></label>
          <label>Correo de contacto*<input name="correo_contacto" type="email" value={form.correo_contacto} onChange={handleChange} required /></label>
          <label>Información adicional<textarea name="informacion_adicional" value={form.informacion_adicional} onChange={handleChange} /></label>
          <label>Skills (separados por coma)<input name="skills" value={form.skills.join(",")} onChange={e => handleArrayChange("skills", e.target.value)} /></label>
          <label>Tags (separados por coma)<input name="tags" value={form.tags.join(",")} onChange={e => handleArrayChange("tags", e.target.value)} /></label>
          <label>Modalidad*
            <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </label>
          <label>Lugar<input name="lugar" value={form.lugar} onChange={handleChange} /></label>
          <label>Fecha y hora*<input name="fecha_hora" type="datetime-local" value={form.fecha_hora} onChange={handleChange} required /></label>
          <label><input name="requiere_postulacion" type="checkbox" checked={form.requiere_postulacion} onChange={handleChange} /> Requiere postulación</label>
          <label>Imagen (JPEG, PNG, WebP, máx 10MB)<input name="imagen" type="file" accept="image/*" onChange={handleChange} /></label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={()=>navigate("/admin-events")} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
      </div>
    </AdminSidebar>
  );
}
