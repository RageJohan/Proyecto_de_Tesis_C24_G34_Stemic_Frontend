import React from "react";
import Header from "./Header";
import "../styles/Organizations.css";

// Datos de ejemplo para alianzas
const featuredAlliances = [
  {
    name: "Fundación ABC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/React.svg",
    description: "Apoyando la educación STEM en comunidades vulnerables.",
    website: "https://fundacionabc.org"
  },
  {
    name: "Red Solidaria",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    description: "Red de ONGs aliadas para el desarrollo social.",
    website: "https://redsolidaria.org"
  }
];

const otherAlliances = [
  {
    name: "ONG Esperanza",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg",
    description: "Promoviendo oportunidades para jóvenes.",
    website: "https://ongesperanza.org"
  },
  {
    name: "Tech4Good",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    description: "Tecnología con impacto social.",
    website: "https://tech4good.org"
  },
  {
    name: "Mujeres STEM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg",
    description: "Impulsando la participación femenina en ciencia y tecnología.",
    website: "https://mujeresstem.org"
  }
];

export default function Organizations() {
  return (
    <>
      <Header />
      <div className="orgs-container fade-in-uniform">
        <h1 className="orgs-title">Nuestras Alianzas</h1>
        <div className="orgs-featured">
          {featuredAlliances.map((ally, idx) => (
            <div
              className="orgs-featured-card"
              key={idx}
            >
              <img src={ally.logo} alt={ally.name} className="orgs-featured-logo" />
              <div className="orgs-featured-info">
                <h2 className="orgs-featured-name">{ally.name}</h2>
                <p className="orgs-featured-desc">{ally.description}</p>
                <a href={ally.website} target="_blank" rel="noopener noreferrer" className="orgs-featured-link">Visitar sitio</a>
              </div>
            </div>
          ))}
        </div>
        <h3 className="orgs-subtitle">Otras alianzas</h3>
        <div className="orgs-grid">
          {otherAlliances.map((ally, idx) => (
            <div
              className="orgs-card"
              key={idx}
            >
              <img src={ally.logo} alt={ally.name} className="orgs-card-logo" />
              <div className="orgs-card-info">
                <h4 className="orgs-card-name">{ally.name}</h4>
                <p className="orgs-card-desc">{ally.description}</p>
                <a href={ally.website} target="_blank" rel="noopener noreferrer" className="orgs-card-link">Ver más</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
