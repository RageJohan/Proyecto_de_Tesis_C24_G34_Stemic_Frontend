import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import AdminSidebar from "./AdminSidebar";
import OrganizerSidebar from "./OrganizerSidebar";
import { useAuth } from "../context/AuthContext";
import {
  getEventById,
  getEventPostulationForm,
  saveEventPostulationForm,
} from "../services/api";
import "../styles/EventFormBuilder.css";

const defaultSchema = {
  title: "Postulación al evento",
  description:
    "Completa las preguntas para postular al evento. Puedes personalizarlas desde este editor.",
  pages: [
    {
      name: "introduccion",
      elements: [
        {
          type: "text",
          name: "nombre_completo",
          title: "Nombre completo",
          isRequired: true,
        },
        {
          type: "text",
          inputType: "email",
          name: "correo",
          title: "Correo electrónico",
          isRequired: true,
        },
        {
          type: "comment",
          name: "motivacion",
          title: "¿Por qué te gustaría participar en este evento?",
          isRequired: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: false,
  questionTypes: [
    "text",
    "comment",
    "checkbox",
    "radiogroup",
    "dropdown",
    "rating",
    "boolean",
    "file",
  ],
};

export default function EventFormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventInfo, setEventInfo] = useState(null);
  const [allowCustom, setAllowCustom] = useState(true);

  const creator = useMemo(() => new SurveyCreator(creatorOptions), []);

  useEffect(() => {
    creator.isAutoSave = false;
    creator.showOptions = true;
    creator.showThemeTab = false;
  }, [creator]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [eventData, formData] = await Promise.all([
          getEventById(id),
          getEventPostulationForm(id).catch(() => null),
        ]);

        if (!isMounted) return;

        setEventInfo(eventData);
        const schema = formData?.postulation_schema || defaultSchema;
        creator.JSON = schema;
        setAllowCustom(formData?.allow_custom_form ?? true);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "No se pudo cargar la configuración del formulario");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, creator]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const schema = creator.JSON || defaultSchema;
      if (!Array.isArray(schema.pages) || schema.pages.length === 0) {
        throw new Error("Configura al menos una página con preguntas antes de guardar");
      }

      await saveEventPostulationForm(id, {
        schema,
        allowCustomForm: allowCustom,
      });

      setSuccess("Formulario guardado correctamente");
    } catch (err) {
      setError(err.message || "No se pudo guardar el formulario");
    } finally {
      setSaving(false);
    }
  };

  const Sidebar = user?.rol === "admin" ? AdminSidebar : OrganizerSidebar;

  if (loading) {
    return (
      <Sidebar>
        <div className="event-form-builder__loading">Cargando configurador...</div>
      </Sidebar>
    );
  }

  if (error && !eventInfo) {
    return (
      <Sidebar>
        <div className="event-form-builder__error">{error}</div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="event-form-builder__container">
        <div className="event-form-builder__header">
          <div>
            <button className="event-form-builder__back" onClick={() => navigate(-1)}>
              ← Volver
            </button>
            <h1>Configurador de formulario</h1>
            {eventInfo && <p className="event-form-builder__subtitle">{eventInfo.titulo}</p>}
          </div>
          <div className="event-form-builder__actions">
            <label className="event-form-builder__toggle">
              <input
                type="checkbox"
                checked={allowCustom}
                onChange={(e) => setAllowCustom(e.target.checked)}
              />
              <span>Habilitar formulario personalizado</span>
            </label>
            <button
              className="event-form-builder__save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {error && <div className="event-form-builder__alert event-form-builder__alert--error">{error}</div>}
        {success && (
          <div className="event-form-builder__alert event-form-builder__alert--success">{success}</div>
        )}

        {allowCustom ? (
          <div className="event-form-builder__creator">
            <SurveyCreatorComponent creator={creator} />
          </div>
        ) : (
          <div className="event-form-builder__disabled">
            <p>
              El formulario personalizado está deshabilitado. Activa el interruptor para editar las
              preguntas y solicitar información adicional a los postulantes.
            </p>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
