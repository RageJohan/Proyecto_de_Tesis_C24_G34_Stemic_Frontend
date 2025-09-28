import React, { useState, useRef, useEffect } from "react";
import { getProfile, updateProfile } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function ProfileEdit() {
  const [form, setForm] = useState({
    nombre: "",
    gender: "",
    phone_number: "",
    birth_date: "",
    correo: "",
    description: "",
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatar, setAvatar] = useState("/src/assets/JoinUs1.JPG");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    getProfile(token)
      .then((res) => {
        const data = res.data || {};
        setForm({
          nombre: data.nombre || "",
          gender: data.gender || "",
          phone_number: data.phone_number || "",
          birth_date: data.birth_date || "",
          correo: data.correo || "",
          description: data.description || "",
          interests: Array.isArray(data.interests) ? data.interests.join(", ") : "",
        });
        if (data.avatar_url) setAvatar(data.avatar_url);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar el perfil");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      await updateProfile(form, token);
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setError("No se pudo actualizar el perfil");
    }
    setLoading(false);
  };

  return (
    <div className="profile-container no-bg">
      <div className="profile-header-row">
        <h1 className="profile-title">
          <span className="profile-title-green">MI</span>{" "}
          <span className="profile-title-blue">PERFIL</span>
        </h1>
        <button className="profile-back-btn" onClick={() => navigate("/")}> 
          Volver al inicio
        </button>
      </div>
      <div className="profile-avatar-wrapper">
        <img src={avatar} alt="Avatar" className="profile-avatar" />
        <button
          type="button"
          className="profile-avatar-upload-btn"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Cambiar foto
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>
      <form className="profile-form wide" onSubmit={handleSubmit}>
        <label className="profile-label">
          Nombres
          <input
            type="text"
            name="nombre"
            className="profile-input"
            placeholder="Primer y Segundo Nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </label>
        <div className="profile-row">
          <label className="profile-label" style={{ flex: 1 }}>
            Género
            <select
              name="gender"
              className="profile-input"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Seleccione su género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label className="profile-label" style={{ flex: 1 }}>
            Número telefónico
            <input
              type="text"
              name="phone_number"
              className="profile-input"
              placeholder="987654321"
              value={form.phone_number}
              onChange={handleChange}
            />
          </label>
        </div>
        <label className="profile-label">
          Fecha Nacimiento
          <input
            type="date"
            name="birth_date"
            className="profile-input"
            value={form.birth_date}
            onChange={handleChange}
          />
        </label>
        <label className="profile-label">
          Correo electrónico
          <input
            type="email"
            name="correo"
            className="profile-input"
            placeholder="Ingresa tu correo electrónico"
            value={form.correo}
            onChange={handleChange}
          />
        </label>
        <label className="profile-label">
          Descripción
          <textarea
            name="description"
            className="profile-input"
            placeholder="Ingresa una descripción acerca de ti"
            value={form.description}
            onChange={handleChange}
            rows={2}
          />
        </label>
        <label className="profile-label">
          Intereses
          <input
            type="text"
            name="interests"
            className="profile-input"
            placeholder="Ingresa tus intereses"
            value={form.interests}
            onChange={handleChange}
          />
        </label>
        <button type="submit" className="profile-btn" disabled={loading}>
          {loading ? "Guardando..." : "GUARDAR"}
        </button>
        {error && <div style={{color:'red', marginTop:10}}>{error}</div>}
        {success && <div style={{color:'green', marginTop:10}}>{success}</div>}
      </form>
    </div>
  );
}
