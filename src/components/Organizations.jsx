import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/Organizations.css";
import { getAlliances } from "../services/api";

export default function Organizations() {
  const [alliances, setAlliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAlliances()
      .then((data) => setAlliances(data))
      .catch(() => setError("No se pudieron cargar las alianzas"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="orgs-container fade-in-uniform">
        <h1 className="orgs-title">Nuestras Alianzas</h1>
        {loading ? (
          <div className="orgs-loading">Cargando alianzas...</div>
        ) : error ? (
          <div className="orgs-error">{error}</div>
        ) : alliances.length === 0 ? (
          <div className="orgs-empty">No hay alianzas registradas.</div>
        ) : (
          <div className="orgs-grid">
            {alliances.map((ally) => (
              <div className="orgs-card" key={ally.id || ally._id || ally.nombre}>
                <img src={ally.logo_url} alt={ally.nombre} className="orgs-card-logo" />
                <div className="orgs-card-info">
                  <h4 className="orgs-card-name">{ally.nombre}</h4>
                  <p className="orgs-card-desc">{ally.descripcion}</p>
                  {ally.sitio_web && (
                    <a
                      href={ally.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="orgs-card-link"
                    >
                      Ver más
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
