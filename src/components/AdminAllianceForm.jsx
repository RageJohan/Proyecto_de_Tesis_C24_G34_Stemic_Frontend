import React, { useState, useRef, useEffect } from "react";
import { createAlliance, updateAlliance, getAllianceById } from "../services/api";
import { validateAllianceForm, validateImage, validateImageDimensions } from "../utils/validations";
import "../styles/AdminAllianceForm.css";

export default function AdminAllianceForm({ allianceId = null, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sitio_web: "",
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño de archivo
    const imageErrors = validateImage(file);
    if (imageErrors.length > 0) {
      setErrors(prev => ({ ...prev, logo: imageErrors }));
      return;
    }

    try {
      // Validar dimensiones
      const dimensionErrors = await validateImageDimensions(file);
      if (dimensionErrors.length > 0) {
        setErrors(prev => ({ ...prev, logo: dimensionErrors }));
        return;
      }

      // Si pasa todas las validaciones
      setForm(f => ({ ...f, logo: file }));
      setErrors(prev => ({ ...prev, logo: null }));
      
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } catch (err) {
      setErrors(prev => ({ ...prev, logo: ['Error al procesar la imagen'] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setErrors({});

    // Validar campos del formulario
    const formErrors = validateAllianceForm(form);
    
    // Validar logo para alianzas nuevas
    if (!allianceId && (!form.logo || !(form.logo instanceof File))) {
      formErrors.logo = ['Por favor selecciona un logo para la alianza'];
    }

    // Si hay errores, mostrarlos y detener el envío
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
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
      setGeneralError(err.message || `Error al ${action} la alianza`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alliance-form-modal">
      <form className="admin-alliance-form" onSubmit={handleSubmit}>
        <h3>{allianceId ? 'Editar alianza' : 'Crear nueva alianza'}</h3>
        <div className="form-group">
          <label>
            Nombre:
            <input 
              name="nombre" 
              value={form.nombre} 
              onChange={handleChange} 
              className={errors.nombre ? 'input-error' : ''}
              required 
            />
          </label>
          {errors.nombre && <div className="field-error">{errors.nombre}</div>}
        </div>

        <div className="form-group">
          <label>
            Descripción:
            <textarea 
              name="descripcion" 
              value={form.descripcion} 
              onChange={handleChange}
              className={errors.descripcion ? 'input-error' : ''}
              required 
            />
          </label>
          {errors.descripcion && <div className="field-error">{errors.descripcion}</div>}
        </div>

        <div className="form-group">
          <label>
            Logo:
            <div className="logo-upload-section">
              {preview && (
                <div className="logo-preview">
                  <img 
                    src={preview} 
                    alt="Vista previa del logo" 
                    style={{maxWidth: '150px', maxHeight: '150px', objectFit: 'contain'}} 
                  />
                </div>
              )}
              <button
                type="button"
                className={`logo-upload-btn ${errors.logo ? 'btn-error' : ''}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {preview ? 'Cambiar logo' : 'Seleccionar logo'}
              </button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </div>
          </label>
          {errors.logo && (
            <div className="field-error">
              {Array.isArray(errors.logo) ? errors.logo.map((err, i) => (
                <div key={i}>{err}</div>
              )) : errors.logo}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            Sitio web:
            <input 
              name="sitio_web" 
              value={form.sitio_web} 
              onChange={handleChange}
              className={errors.sitio_web ? 'input-error' : ''}
              placeholder="https://ejemplo.com"
            />
          </label>
          {errors.sitio_web && <div className="field-error">{errors.sitio_web}</div>}
        </div>

        {generalError && <div className="form-error">{generalError}</div>}
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-crear">
            {loading ? (allianceId ? "Guardando..." : "Creando...") : (allianceId ? "Guardar" : "Crear")}
          </button>
        </div>
      </form>
    </div>
  );
}
