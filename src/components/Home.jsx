import React, { useEffect } from "react";
import "../styles/Home.css";
import Header from "./Header";
import { useLoader } from "../context/LoaderContext";

export default function Home() {
  const { setLoading } = useLoader();
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 900);
    return () => {
      setLoading(false);
      clearTimeout(timer);
    };
  }, [setLoading]);

  return (
    <>
      <Header />
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">Impulsando el futuro STEM en jóvenes</h1>
          <p className="home-hero-subtitle">Conecta, aprende y crece con la comunidad STEM más activa de la región.</p>
          <div className="home-hero-actions">
            <a href="/join-us" className="home-btn home-btn-primary">Únete</a>
            <a href="/events" className="home-btn home-btn-secondary">Explora eventos</a>
          </div>
        </div>
        <div className="home-hero-illustration">
          {/* Aquí puedes poner una imagen SVG, ilustración o animación */}
          <img src="/vite.svg" alt="STEM Ilustración" />
        </div>
      </section>

      <section className="home-benefits">
        <h2 className="home-benefits-title">¿Por qué unirte?</h2>
        <div className="home-benefits-cards">
          <div className="home-benefit-card">
            <span className="home-benefit-icon">🎓</span>
            <h3>Eventos y talleres</h3>
            <p>Participa en actividades exclusivas para potenciar tus habilidades STEM.</p>
          </div>
          <div className="home-benefit-card">
            <span className="home-benefit-icon">🤝</span>
            <h3>Red de alianzas</h3>
            <p>Conecta con organizaciones y expertos que impulsan el cambio.</p>
          </div>
          <div className="home-benefit-card">
            <span className="home-benefit-icon">📚</span>
            <h3>Recursos gratuitos</h3>
            <p>Accede a materiales, guías y recursos para tu desarrollo.</p>
          </div>
          <div className="home-benefit-card">
            <span className="home-benefit-icon">🌟</span>
            <h3>Comunidad activa</h3>
            <p>Forma parte de una red de jóvenes apasionados por la ciencia y tecnología.</p>
          </div>
        </div>
      </section>
    </>
  );
}
