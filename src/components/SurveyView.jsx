import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEventById,
  getEvaluationQuestions,
  submitEvaluation,
} from "../services/api";
import Header from "./Header";
import "../styles/SurveyView.css";
import Loader from "./Loader";

// Componente para las estrellas de puntuación
const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "star-filled" : "star-empty"}
          onClick={() => !disabled && onRatingChange(star)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function SurveyView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // 'responses' será el objeto plano que espera el backend
  const [responses, setResponses] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [eventData, questionsData] = await Promise.all([
          getEventById(eventId),
          getEvaluationQuestions(),
        ]);

        setEvent(eventData);
        setQuestions(questionsData);

        // Inicializar el estado de las respuestas
        const initialResponses = {};
        questionsData.forEach((q) => {
          if (q.tipo === "escala") {
            // Usamos un string vacío para 'sin responder' (lo validaremos al enviar)
            initialResponses[q.id] = ""; 
          } else if (q.tipo === "texto") {
            initialResponses[q.id] = ""; // string vacío para texto
          }
        });
        setResponses(initialResponses);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar los datos de la encuesta.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  // Handler unificado para cualquier tipo de respuesta
  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // 1. Validar que todas las preguntas de ESCALA estén respondidas
    // (Tu backend valida de "pregunta_1" a "pregunta_12")
    const scaleQuestions = questions.filter(q => q.tipo === 'escala');
    const incompleteScale = scaleQuestions.some(
      (q) => !responses[q.id] || responses[q.id] === ""
    );

    if (incompleteScale) {
      setError("Por favor, responde todas las preguntas de calificación (estrellas).");
      setIsSubmitting(false);
      return;
    }

    // =======================================================
    // AQUÍ ESTÁ LA CORRECCIÓN CLAVE:
    // Construimos el payload EXACTO que espera tu backend.
    // =======================================================
    const payload = {
      evento_id: eventId,
      respuestas: responses, // 'responses' es el objeto plano { pregunta_1: 5, ... }
    };

    try {
      // 3. Llamar a la función de la API
      // Esta función (submitEvaluation) ya apunta a POST /api/evaluations
      const result = await submitEvaluation(payload);
      setSuccess(result.message || "¡Evaluación enviada con éxito! Gracias.");
      setIsSubmitting(true);
      setTimeout(() => navigate("/participations"), 2500);
    } catch (err) {
      // Aquí se manejan los errores de la API (ej. "No se registró tu asistencia")
      setError(err.message || "No se pudo enviar la evaluación.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header />
      <div className="survey-container">
        {event && (
          <h1 className="survey-title">
            Encuesta de Satisfacción:{" "}
            <span className="survey-event-name">{event.titulo}</span>
          </h1>
        )}

        {error && <div className="survey-message survey-error">{error}</div>}
        {success && <div className="survey-message survey-success">{success}</div>}

        {!error && !success && (
          <p className="survey-description">
            Tu opinión es muy importante para nosotros. Por favor, califica tu
            experiencia.
          </p>
        )}

        <form className="survey-form" onSubmit={handleSubmit}>
          
          {questions.map((q) => (
            <div className="survey-question" key={q.id}>
              
              <label className="survey-question-label" htmlFor={q.id}>
                {q.pregunta}
                {/* Añadimos un indicador de 'requerido' para las de escala */}
                {q.tipo === 'escala' && <span style={{ color: 'red' }}> *</span>}
              </label>
              
              {q.tipo === "escala" && (
                <StarRating
                  rating={responses[q.id] || 0} // Si es "" o 0, muestra 0 estrellas
                  onRatingChange={(rating) => handleResponseChange(q.id, rating)}
                  disabled={isSubmitting}
                />
              )}
              
              {q.tipo === "texto" && (
                <textarea
                  id={q.id}
                  className="survey-textarea"
                  rows="3"
                  placeholder={q.placeholder || "Escribe tu respuesta..."}
                  value={responses[q.id] || ""}
                  onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  disabled={isSubmitting}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="survey-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Evaluación"}
          </button>
        </form>
      </div>
    </>
  );
}