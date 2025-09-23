import React, { useEffect, useRef } from "react";
import "../styles/JoinUs.css";
import JoinUsImg from "../assets/JoinUs1.JPG";
import Header from "./Header";

function AnimatedTitle({ text }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span key={i} style={{ animationDelay: `${0.04 * i + 0.2}s` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}

function ParticlesBG() {
  const ref = useRef();
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const colors = ["var(--color-acento)", "#fff", "#7957F2", "#A6249D"];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.width = `${16 + Math.random() * 32}px`;
      p.style.height = p.style.width;
      p.style.left = `${Math.random() * 100}vw`;
      p.style.bottom = `-${Math.random() * 20}vh`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = `${10 + Math.random() * 8}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(p);
    }
    return () => {
      container.innerHTML = "";
    };
  }, []);
  return <div className="joinus-bg-particles" ref={ref} />;
}

export default function JoinUs() {
  useEffect(() => {
    document.body.classList.add("joinus-bg-body");
    return () => document.body.classList.remove("joinus-bg-body");
  }, []);

  return (
    <>
      <Header />
      <div className="joinus-container">
        <ParticlesBG />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "340px",
            overflow: "hidden",
          }}
        >
          <img
            src={JoinUsImg}
            alt="Fondo LEAD AT TECSUP"
            className="joinus-hero-img"
          />
          <div className="joinus-hero-title">
            <AnimatedTitle text="¡Únete a la comunidad LEAD AT TECSUP!" />
          </div>
        </div>
        <div className="joinus-main">
          <div className="joinus-info">
            <div>
              <h2>¿Quieres ser parte de la organización?</h2>
              <p>
                Completa el siguiente formulario para postular y sumarte a
                nuestro equipo.
              </p>
            </div>
          </div>
          <div className="joinus-form-box">
            <form className="joinus-form">
              <input
                type="text"
                placeholder="Carrera o especialidad"
                required
                className="joinus-input"
              />
              <textarea
                placeholder="¿Por qué quieres unirte a LEAD AT TECSUP?"
                required
                className="joinus-textarea"
                rows={4}
              />
              <button type="submit" className="joinus-btn">
                Postular
              </button>
            </form>
          </div>
        </div>
        <div className="joinus-social-final">
          No olvides seguirnos en nuestras redes sociales:
          <div className="joinus-social-icons">
            <a
              href="https://www.instagram.com/leadattecsup/"
              target="_blank"
              rel="noopener noreferrer"
              className="joinus-social-icon instagram"
            >
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.981.981-1.275 2.093-1.334 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.281.072-1.69.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/lead-at-tecsup/"
              target="_blank"
              rel="noopener noreferrer"
              className="joinus-social-icon linkedin"
            >
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.156 1.459-2.156 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.605v5.591z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
