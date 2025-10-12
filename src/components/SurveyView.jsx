
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import '../styles/SurveyView.css';

// Componente simple de estrellas
const StarRating = ({ value, onChange, name }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= value ? 'star filled' : 'star'}
          onClick={() => onChange(name, star)}
          style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= value ? '#FFD700' : '#ccc' }}
          role="button"
          aria-label={`Calificar con ${star} estrellas`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const SurveyView = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [eventoId, setEventoId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/preguntas-evaluaciones`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Error al obtener las preguntas');
        const data = await response.json();
        console.log('Respuesta de preguntas-evaluaciones:', data);
        // Soportar respuesta como array directo o como objeto con propiedad
        let questionsArray = [];
        if (Array.isArray(data)) {
          questionsArray = data;
        } else if (Array.isArray(data.preguntas)) {
          questionsArray = data.preguntas;
        } else if (Array.isArray(data.data)) {
          questionsArray = data.data;
        } else {
          throw new Error('La respuesta de preguntas-evaluaciones no es un array ni contiene un array');
        }
        setQuestions(questionsArray);
        // Inicializar las respuestas con un objeto vacío
        const initialAnswers = {};
        questionsArray.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error al cargar las preguntas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);


  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!eventoId) {
        alert('Por favor ingresa el ID del evento');
        return;
      }
      const payload = {
        evento_id: eventoId,
        respuestas: answers
      };
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/evaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Error al enviar la encuesta');
      alert('Encuesta enviada con éxito');
    } catch (error) {
      console.error('Error al enviar la encuesta:', error);
      alert('Error al enviar la encuesta');
    }
  };

  if (loading) {
    return <div>Cargando preguntas...</div>;
  }

  return (
    <div className="survey-container">
      <h2>Encuesta de Evaluación</h2>
      <form onSubmit={handleSubmit}>
        <div className="question-container">
          <label htmlFor="evento_id">ID del Evento</label>
          <input
            type="text"
            id="evento_id"
            value={eventoId}
            onChange={e => setEventoId(e.target.value)}
            placeholder="Ingresa el ID del evento"
            required
          />
        </div>
        {questions.map((question, idx) => (
          <div key={question.id} className="question-container">
            <label>{question.pregunta || question.texto || `Pregunta ${idx + 1}`}</label>
            {idx < 12 ? (
              <StarRating
                value={Number(answers[question.id]) || 0}
                onChange={handleAnswerChange}
                name={question.id}
              />
            ) : (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={e => handleAnswerChange(question.id, e.target.value)}
                placeholder="Escribe tu respuesta"
                required
              />
            )}
          </div>
        ))}
        <button type="submit" className="submit-button">
          Enviar Encuesta
        </button>
      </form>
    </div>
  );
};

export default SurveyView;