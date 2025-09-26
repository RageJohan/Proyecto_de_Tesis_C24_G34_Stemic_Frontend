import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function ProfileEdit() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    phone: "",
    birthdate: "",
    email: "",
    description: "",
    interests: "",
  });
  const [avatar, setAvatar] = useState("/src/assets/JoinUs1.JPG");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
      <form className="profile-form wide">
        <label className="profile-label">
          Nombres
          <input
            type="text"
            name="name"
            className="profile-input"
            placeholder="Primer y Segundo Nombre"
            value={form.name}
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
              name="phone"
              className="profile-input"
              placeholder="987654321"
              value={form.phone}
              onChange={handleChange}
            />
          </label>
        </div>
        <label className="profile-label">
          Fecha Nacimiento
          <input
            type="date"
            name="birthdate"
            className="profile-input"
            value={form.birthdate}
            onChange={handleChange}
          />
        </label>
        <label className="profile-label">
          Correo electrónico
          <input
            type="email"
            name="email"
            className="profile-input"
            placeholder="Ingresa tu correo electrónico"
            value={form.email}
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
        <button type="button" className="profile-btn">
          GUARDAR
        </button>
      </form>
    </div>
  );
}
