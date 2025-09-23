import React from "react";
import Header from "./Header";
import "../styles/Participations.css";

// Simulación de participaciones
const participations = [
  {
    event: "LEAD IBM EXPLORE DAY",
    date: "20/06/2025",
    modality: "Presencial",
  },
  {
    event: "HACKATHON STEMIC",
    date: "22/07/2025",
    modality: "Virtual",
  },
  {
    event: "BOOTCAMP DE LIDERAZGO",
    date: "05/08/2025",
    modality: "Híbrido",
  },
];

export default function Participations() {
  return (
    <>
      <Header />
      <div className="participations-view">
        <h2 className="participations-title">Mis Participaciones</h2>
        <div className="participations-table-box">
          <table className="participations-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Modalidad</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.event}</td>
                  <td>{p.date}</td>
                  <td>{p.modality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
