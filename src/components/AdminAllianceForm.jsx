import React, { useState, useRef, useEffect } from "react";
import { createAlliance, updateAlliance, getAllianceById } from "../services/api";
import "../styles/AdminAllianceForm.css";

export default function AdminAllianceForm({ allianceId = null, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sitio_web: "",
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [initialLogo, setInitialLogo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (allianceId) {
      setLoading(true);
      getAllianceById(allianceId)
        .then(data => {
          if (!data) {
            throw new Error('No se encontró la alianza');
          }
          setForm({
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            sitio_web: data.sitio_web || "",
            logo: null
          });
          if (data.logo_url) {
            setInitialLogo(data.logo_url);
            setPreview(data.logo_url);
          }
        })
        .catch(err => {
          setError(err.message);
          if (onCancel) {
            setTimeout(onCancel, 2000); // Cerrar el formulario después de mostrar el error
          }
        })
        .finally(() => setLoading(false));
    }
  }, [allianceId, onCancel]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm(f => ({ ...f, logo: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validar que se haya seleccionado una imagen para alianzas nuevas
    if (!allianceId && (!form.logo || !(form.logo instanceof File))) {
      setError("Por favor selecciona un logo para la alianza");
      setLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'logo' && value instanceof File) {
          formData.append('logo', value);
        } else if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      if (allianceId) {
        await updateAlliance(allianceId, formData);
      } else {
        await createAlliance(formData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const action = allianceId ? "actualizar" : "crear";
      setError(err.message || `Error al ${action} la alianza`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alliance-form-modal">
      <form className="admin-alliance-form" onSubmit={handleSubmit}>
        <h3>{allianceId ? 'Editar alianza' : 'Crear nueva alianza'}</h3>
        <label>
          Nombre:
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Descripción:
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </label>
        <label>
          Logo:
          <div className="logo-upload-section">
            {preview && (
              <div className="logo-preview">
                <img src={preview} alt="Vista previa del logo" style={{maxWidth: '150px', maxHeight: '150px', objectFit: 'contain'}} />
              </div>
            )}
            <button
              type="button"
              className="logo-upload-btn"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {preview ? 'Cambiar logo' : 'Seleccionar logo'}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleLogoChange}
            />
          </div>
        </label>
        <label>
          Sitio web:
          <input name="sitio_web" value={form.sitio_web} onChange={handleChange} />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-crear">
            {loading ? (allianceId ? "Guardando..." : "Creando...") : (allianceId ? "Guardar" : "Crear")}
          </button>
        </div>
      </form>
    </div>
  );
}
