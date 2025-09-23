import React from "react";

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <div className="event-card-img-box">
        <img src={event.image} alt={event.title} className="event-card-img" />
        <div className="event-card-date">{event.date}</div>
      </div>
      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{event.description}</p>
        <div className="event-card-tags">
          {event.tags.map((tag, i) => (
            <span className={`event-card-tag tag-${i}`} key={i}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
