import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEventById, updateEvent } from "../services/api";
import "../styles/EventCreateModal.css";
import AdminSidebar from "./AdminSidebar";
import OrganizerSidebar from "./OrganizerSidebar";
import { useAuth } from "../context/AuthContext";

export default function EventEditView() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getEventById(id)
      .then((eventData) => {
        setForm({
          ...eventData,
          skills: Array.isArray(eventData.skills) ? eventData.skills : [],
          tags: Array.isArray(eventData.tags) ? eventData.tags : [],
          modalidad: eventData.modalidad || "virtual",
          allow_custom_form: eventData.allow_custom_form ?? false,
        });
      })
      .catch(() => setError("Error al cargar datos del evento"))
      .finally(() => setLoading(false));
  }, [id]);

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
      const skipKeys = new Set([
        "postulation_schema",
        "postulation_schema_version"
      ]);
      Object.entries(form).forEach(([key, value]) => {
        if (skipKeys.has(key)) {
          return;
        }
        if (key === "imagen" && value) {
          formData.append("imagen", value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });
      await updateEvent(id, formData);
      navigate("/admin-events");
    } catch (err) {
      setError(err.message || "Error updating event");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <div className="orgs-loading">Loading event...</div>;

  const Sidebar = user?.rol === "admin" ? AdminSidebar : OrganizerSidebar;
  const builderPath = user?.rol === "admin"
    ? `/admin-events/${id}/form-builder`
    : `/organizer-events/${id}/form-builder`;

  return (
    <Sidebar>
      <div className="modal-overlay" style={{position:'static',background:'none',padding:0}}>
        <div className="modal-content" style={{maxWidth:800,margin:'0 auto'}}>
        <h2>Edit event</h2>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
            <input
              type="checkbox"
              name="allow_custom_form"
              checked={form.allow_custom_form || false}
              onChange={handleChange}
            />
            Habilitar formulario personalizado
          </label>
          <Link
            to={builderPath}
            className="event-detail-back btn-inscribirse"
            style={{textDecoration:'none'}}
          >
            Configurar preguntas
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="event-form">
          <label>Title*<input name="titulo" value={form.titulo} onChange={handleChange} required minLength={3} /></label>
          <label>Description*<textarea name="descripcion" value={form.descripcion} onChange={handleChange} required minLength={10} /></label>
          <label>Priority application date*<input name="fecha_aplicacion_prioritaria" type="date" value={form.fecha_aplicacion_prioritaria?.slice(0,10)||''} onChange={handleChange} required /></label>
          <label>General application date*<input name="fecha_aplicacion_general" type="date" value={form.fecha_aplicacion_general?.slice(0,10)||''} onChange={handleChange} required /></label>
          <label>Duration*<input name="duracion" type="text" placeholder="HH:MM:SS" value={form.duracion} onChange={handleChange} required pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" /></label>
          <label>Contact email*<input name="correo_contacto" type="email" value={form.correo_contacto} onChange={handleChange} required /></label>
          <label>Additional info<textarea name="informacion_adicional" value={form.informacion_adicional} onChange={handleChange} /></label>
          <label>Skills (comma separated)<input name="skills" value={form.skills.join(",")} onChange={e => handleArrayChange("skills", e.target.value)} /></label>
          <label>Tags (comma separated)<input name="tags" value={form.tags.join(",")} onChange={e => handleArrayChange("tags", e.target.value)} /></label>
          <label>Mode*
            <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Hybrid</option>
            </select>
          </label>
          <label>Place<input name="lugar" value={form.lugar} onChange={handleChange} /></label>
          <label>Date and time*<input name="fecha_hora" type="datetime-local" value={form.fecha_hora?.slice(0,16)||''} onChange={handleChange} required /></label>
          <label><input name="requiere_postulacion" type="checkbox" checked={form.requiere_postulacion} onChange={handleChange} /> Requires application</label>
          <label>Image (JPEG, PNG, WebP, max 10MB)<input name="imagen" type="file" accept="image/*" onChange={handleChange} /></label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={()=>navigate("/admin-events")} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
      </div>
    </Sidebar>
  );
}
