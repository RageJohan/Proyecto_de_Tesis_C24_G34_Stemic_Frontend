import { useEffect, useMemo, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import "../styles/EventPostulationModal.css";
import {
  getEventPostulationForm,
  getMyEventPostulation,
  submitEventPostulation,
} from "../services/api";

export default function EventPostulationModal({ eventId, open, onClose, onSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allowCustom, setAllowCustom] = useState(false);
  const [schema, setSchema] = useState(null);
  const [initialResponses, setInitialResponses] = useState(null);

  useEffect(() => {
    if (!open) {
      setError("");
      setSuccess("");
      return;
    }

    let isMounted = true;

    async function loadForm() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const formConfig = await getEventPostulationForm(eventId);
        if (!isMounted) return;

        setAllowCustom(Boolean(formConfig?.allow_custom_form));

        if (formConfig?.allow_custom_form && formConfig?.postulation_schema) {
          setSchema(formConfig.postulation_schema);
        } else {
          setSchema(null);
        }

        const myPostulation = await getMyEventPostulation(eventId).catch(() => null);
        if (!isMounted) return;
        setInitialResponses(myPostulation?.responses || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "No se pudo cargar el formulario del evento");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadForm();

    return () => {
      isMounted = false;
    };
  }, [eventId, open]);

  const survey = useMemo(() => {
    if (!schema) return null;
    const model = new Model(schema);
    if (initialResponses) {
      model.data = initialResponses;
    }
    model.onComplete.add(async (sender) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        await submitEventPostulation(eventId, sender.data);
        setSuccess("Tu postulación fue enviada correctamente");
        setInitialResponses(sender.data);
        if (onSubmitted) {
          onSubmitted();
        }
      } catch (err) {
        setError(err.message || "No se pudo enviar la postulación");
      } finally {
        setLoading(false);
      }
    });
    return model;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, initialResponses, eventId]);

  if (!open) return null;

  return (
    <div className="event-postulation-modal__overlay" role="dialog" aria-modal="true">
      <div className="event-postulation-modal__content">
        <button className="event-postulation-modal__close" onClick={onClose}>
          ×
        </button>
        <h2>Postulación al evento</h2>
        {loading && <div className="event-postulation-modal__status">Cargando...</div>}
        {error && <div className="event-postulation-modal__alert event-postulation-modal__alert--error">{error}</div>}
        {success && (
          <div className="event-postulation-modal__alert event-postulation-modal__alert--success">{success}</div>
        )}

        {!allowCustom && !loading && (
          <div className="event-postulation-modal__placeholder">
            El organizador no ha configurado un formulario de postulación personalizado para este evento.
          </div>
        )}

        {allowCustom && schema && survey && (
          <div className="event-postulation-modal__survey">
            <Survey model={survey} />
          </div>
        )}
      </div>
    </div>
  );
}
