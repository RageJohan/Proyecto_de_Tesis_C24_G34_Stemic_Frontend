import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-section footer-brand">
        <h2>STEMIC</h2>
        <p>Plataforma de medición de impacto STEM.<br />© {new Date().getFullYear()} STEMIC. Todos los derechos reservados.</p>
      </div>
      <div className="footer-section">
        <h3>Enlaces Rápidos</h3>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/eventos">Eventos</a></li>
          <li><a href="/organizaciones">Organizaciones</a></li>
          <li><a href="/unete">Únete</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Recursos</h3>
        <ul>
          <li><a href="/sobre">Sobre Nosotros</a></li>
          <li><a href="/faq">Preguntas Frecuentes</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Contacto</h3>
        <ul>
          <li>Email: contacto@stemic.com</li>
          <li>Tel: +51 999 999 999</li>
          <li><a href="/contacto">Formulario de contacto</a></li>
        </ul>
      </div>
    </footer>
  );
}
