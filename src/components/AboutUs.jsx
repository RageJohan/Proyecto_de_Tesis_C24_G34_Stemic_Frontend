import { useState, useEffect } from "react";
import Header from "./Header";
import "../styles/AboutUs.css";

const pillars = [
  {
    title: "Excelencia Académica",
    description:
      "Buscamos fortalecer el rendimiento académico y las habilidades de aprendizaje de los estudiantes, brindando herramientas, espacios de crecimiento y acompañamiento para impulsar su desarrollo educativo y alcanzar su máximo potencial.",
    icon: "🎓",
  },
  {
    title: "Desarrollo Profesional",
    description:
      "Preparamos a los estudiantes para enfrentar el mundo laboral mediante la promoción de habilidades blandas, liderazgo, trabajo en equipo y pensamiento crítico, construyendo profesionales íntegros y competitivos.",
    icon: "💼",
  },
  {
    title: "Excelencia Femenina",
    description:
      "Fomentamos la equidad y el empoderamiento femenino en STEM, creando oportunidades, espacios de mentoría y visibilidad que inspiren a más mujeres a liderar y transformar la industria tecnológica y científica.",
    icon: "👩‍💻",
  },
  {
    title: "Impacto Comunitario",
    description:
      "Promovemos la conciencia social, el servicio y la solidaridad a través de voluntariados, proyectos y campañas que impacten positivamente en la comunidad y fortalezcan el compromiso ciudadano de nuestros estudiantes.",
    icon: "🌍",
  },
  {
    title: "Liderazgo",
    description:
      "El pilar de Liderazgo empodera a los estudiantes con habilidades, confianza y visión para liderar, fomentando la toma de decisiones éticas y el servicio a los demás.",
    icon: "",
  },
  {
    title: "LEAD Academia",
    description:
      "LEAD Academia permite a los estudiantes universitarios crear eventos y programas para inspirar y educar a jóvenes, fomentando la creatividad y construyendo un pipeline de futuros líderes.",
    icon: "",
  },
  {
    title: "Desarrollo del Capitulo",
    description:
      "El pilar de desarrollo fortalece las conexiones entre los miembros, creando un ambiente inclusivo y colaborativo que fomenta la participación, el apoyo mutuo y el trabajo en equipo.",
    icon: "",
  },
];

const values = [
  {
    title: "LEARN",
    description:
      "Aprendemos de cada experiencia, desafío y persona, cultivando habilidades que nos preparan para enfrentar un mundo en constante cambio.",
  },
  {
    title: "EXPLORE",
    description:
      "Exploramos nuevas ideas, oportunidades y entornos que expanden nuestros horizontes y fortalecen nuestra curiosidad e innovación.",
  },
  {
    title: "ASPIRE",
    description:
      "Aspiramos a superarnos cada día, persiguiendo nuestras metas con pasión, compromiso y propósito para impactar positivamente en nuestro entorno.",
  },
  {
    title: "DISCOVER",
    description:
      "Descubrimos nuestro potencial, talentos y propósito, transformando lo que aprendemos en acciones que construyen un futuro mejor.",
  },
];

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



export default function AboutUs() {
  const [pillarIndex, setPillarIndex] = useState(0);
  const [valueIndex, setValueIndex] = useState(0);
  // El fondo se maneja solo por CSS, no modificar el body

  // Carrusel pilares
  const nextPillar = () =>
    setPillarIndex((prev) => (prev + 1) % pillars.length);
  const prevPillar = () =>
    setPillarIndex((prev) => (prev - 1 + pillars.length) % pillars.length);

  // Carrusel valores
  const nextValue = () => setValueIndex((prev) => (prev + 1) % values.length);
  const prevValue = () =>
    setValueIndex((prev) => (prev - 1 + values.length) % values.length);

  return (
    <>
      <Header />
      <div className="aboutus-bg" />
      <div className="aboutus-overlay" />

      <div className="aboutus-container">
        <h1 className="aboutus-title">
          <AnimatedTitle text="Sobre Nosotros" />
        </h1>

        {/* Acordeón horizontal misión/visión */}
        <div className="aboutus-horizontal-accordion">
          <div className="aboutus-h-accordion-card mision">
            <div className="aboutus-h-accordion-title">Misión</div>
            <div className="aboutus-h-accordion-content">
              LEAD cierra la brecha de falta de oportunidades para estudiantes de comunidades subrepresentadas, brindándoles mentoría, desarrollo de habilidades y experiencias prácticas para que tengan éxito en carreras STEM y accedan a oportunidades globales.
            </div>
          </div>
          <div className="aboutus-h-accordion-card vision">
            <div className="aboutus-h-accordion-title">Visión</div>
            <div className="aboutus-h-accordion-content">
              LEAD sueña con un mundo donde todos los estudiantes, sin importar su origen, cuenten con el apoyo necesario para superar adversidades, perseguir sus sueños y construir un futuro mejor.
            </div>
          </div>
        </div>

        {/* Carrusel profesional de Pilares */}
        <h2 className="aboutus-subtitle">Nuestros Pilares</h2>
        <div
          className="carousel"
          style={{
            maxWidth: 500,
            margin: "0 auto 2.5rem auto",
            position: "relative",
          }}
        >
          <div
            className="carousel-item"
            style={{
              minHeight: 180,
              background: "var(--color-bg)",
              border: "2px solid var(--color-acento)",
              borderRadius: "var(--radius)",
              boxShadow: "0 4px 24px rgba(121,87,242,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2.5rem 2rem",
              transition: "box-shadow 0.3s",
              textAlign: "center",
              position: "relative",
              animation: "fadeInUp 0.7s",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {pillars[pillarIndex].icon}
            </div>
            <h3
              style={{
                color: "var(--color-acento)",
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 10,
              }}
            >
              {pillars[pillarIndex].title}
            </h3>
            <p
              style={{
                color: "var(--color-texto-principal)",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {pillars[pillarIndex].description}
            </p>
          </div>
          {/* Flechas */}
          <button
            className="carousel-button"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              background: "var(--color-principal)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={prevPillar}
            aria-label="Anterior Pilar"
          >
            ‹
          </button>
          <button
            className="carousel-button"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              background: "var(--color-principal)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={nextPillar}
            aria-label="Siguiente Pilar"
          >
            ›
          </button>
          {/* Indicadores */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 18,
            }}
          >
            {pillars.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    pillarIndex === idx ? "var(--color-acento)" : "#444",
                  display: "inline-block",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Carrusel profesional de Valores */}
        <h2 className="aboutus-subtitle">Nuestros Valores</h2>
        <div
          className="carousel"
          style={{ maxWidth: 500, margin: "0 auto", position: "relative" }}
        >
          <div
            className="carousel-item"
            style={{
              minHeight: 160,
              background: "var(--color-bg)",
              border: "2px solid var(--color-terciario)",
              borderRadius: "var(--radius)",
              boxShadow: "0 4px 24px rgba(166,36,157,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2.2rem 2rem",
              transition: "box-shadow 0.3s",
              textAlign: "center",
              position: "relative",
              animation: "fadeInUp 0.7s",
            }}
          >
            <h3
              style={{
                color: "var(--color-terciario)",
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 10,
              }}
            >
              {values[valueIndex].title}
            </h3>
            <p
              style={{
                color: "var(--color-texto-principal)",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {values[valueIndex].description}
            </p>
          </div>
          {/* Flechas */}
          <button
            className="carousel-button"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              background: "var(--color-terciario)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={prevValue}
            aria-label="Anterior Valor"
          >
            ‹
          </button>
          <button
            className="carousel-button"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              background: "var(--color-terciario)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={nextValue}
            aria-label="Siguiente Valor"
          >
            ›
          </button>
          {/* Indicadores */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 18,
            }}
          >
            {values.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    valueIndex === idx ? "var(--color-terciario)" : "#444",
                  display: "inline-block",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
