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

// Iconos SVG (Inline para evitar dependencias extra)
const Icons = {
  Star: ({ filled, onClick, className }) => (
    <svg 
      className={`${className} ${filled ? 'star-filled' : 'star-empty'}`} 
      onClick={onClick}
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  CheckCircle: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  AlertCircle: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// Componente para las estrellas de puntuación (Mejorado con SVG)
const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  // Estado para el hover (efecto visual al pasar el mouse)
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`star-rating ${disabled ? 'disabled' : ''}`} onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icons.Star
          key={star}
          className="star-icon"
          // Lógica de llenado: si el hover es mayor o igual al star, O si no hay hover y el rating guardado es mayor
          filled={star <= (hoverRating || rating)}
          onClick={() => !disabled && onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          style={{ cursor: disabled ? 'default' : 'pointer' }}
        />
      ))}
    </div>
  );
};

export default function SurveyView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
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

        const initialResponses = {};
        questionsData.forEach((q) => {
          initialResponses[q.id] = ""; 
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

    const scaleQuestions = questions.filter(q => q.tipo === 'escala');
    const incompleteScale = scaleQuestions.some(
      (q) => !responses[q.id] || responses[q.id] === ""
    );

    if (incompleteScale) {
      setError("Por favor, califica todas las preguntas obligatorias.");
      setIsSubmitting(false);
      // Scroll al top para ver el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = {
      evento_id: eventId,
      respuestas: responses,
    };

    try {
      const result = await submitEvaluation(payload);
      setSuccess(result.message || "¡Evaluación enviada con éxito! Gracias.");
      setIsSubmitting(true); // Mantener disabled mientras redirige
      setTimeout(() => navigate("/participations"), 2500);
    } catch (err) {
      setError(err.message || "No se pudo enviar la evaluación.");
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="survey-wrapper">
      <Header />
      <div className="survey-container">
        
        {/* Cabecera de la Tarjeta */}
        <div className="survey-header-content">
          {event && (
            <h1 className="survey-title">
              Evaluación de Evento
              <span className="survey-event-name">{event.titulo}</span>
            </h1>
          )}
          {!error && !success && (
            <p className="survey-description">
              Tu opinión nos ayuda a mejorar. Por favor, tómate un momento para calificar tu experiencia.
            </p>
          )}
        </div>

        {/* Mensajes de Feedback */}
        {error && (
          <div className="survey-message survey-error">
            <Icons.AlertCircle />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="survey-message survey-success">
            <Icons.CheckCircle />
            <span>{success}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div className="survey-question" key={q.id}>
              
              <label className="survey-question-label" htmlFor={q.id}>
                {q.pregunta}
                {q.tipo === 'escala' && <span className="required-star">*</span>}
              </label>
              
              {q.tipo === "escala" && (
                <StarRating
                  rating={responses[q.id] || 0}
                  onRatingChange={(rating) => handleResponseChange(q.id, rating)}
                  disabled={isSubmitting}
                />
              )}
              
              {q.tipo === "texto" && (
                <textarea
                  id={q.id}
                  className="survey-textarea"
                  rows="3"
                  placeholder={q.placeholder || "Escribe tu opinión aquí..."}
                  value={responses[q.id] || ""}
                  onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  disabled={isSubmitting}
                />
              )}
            </div>
          ))}

          <div className="form-actions">
            <button
              type="submit"
              className="survey-submit-btn"
              disabled={isSubmitting || success}
              style={{ width: '100%' }}
            >
              {isSubmitting ? "Enviando respuestas..." : "Enviar Evaluación"}
            </button>
            
            <button 
              type="button" 
              className="btn-back"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}