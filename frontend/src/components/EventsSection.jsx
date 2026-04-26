import React, { useState } from "react";

const EMPTY_EVENT = { title: "", description: "", date: "", type: "other", important: false, color: "#6366f1" };

const EventForm = ({ event, onSubmit, onClose }) => {
  const [form, setForm] = useState(
    event
      ? {
          title: event.title || "",
          description: event.description || "",
          date: event.date ? event.date.slice(0, 10) : "",
          type: event.type || "other",
          important: event.important || false,
          color: event.color || "#6366f1",
        }
      : EMPTY_EVENT
  );

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((f) => ({ ...f, [name]: inputType === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{event ? "Edit Event" : "New Event"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} autoFocus placeholder="Event name" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Details..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" name="type" value={form.type} onChange={handleChange}>
                <option value="exam">Exam</option>
                <option value="school">School</option>
                <option value="personal">Personal</option>
                <option value="deadline">Deadline</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" name="important" checked={form.important} onChange={handleChange} id="important-check" />
            <label htmlFor="important-check" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
              ✦ Mark as important
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{event ? "Save Changes" : "Add Event"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventsSection = ({ events, loading, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleFormSubmit = (formData) => {
    if (editingEvent) {
      onEdit(editingEvent._id, formData);
    } else {
      onAdd(formData);
    }
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-overlay"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">▥ Events <span className="card-count">{events.length}</span></h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingEvent(null); setShowForm(true); }}>
            + Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◇</div>
            <div className="empty-text">No events yet. Add your first event!</div>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event) => {
              const d = new Date(event.date);
              return (
                <div key={event._id} className={`event-item ${event.important ? "important" : ""}`}>
                  <div className="event-date-block">
                    <span className="event-day">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="event-num">{d.getDate()}</span>
                    <span className="event-mon">
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                  <div className="event-info">
                    <div className="event-title">
                      {event.important && <span className="important-star">✦ </span>}
                      {event.title}
                    </div>
                    {event.description && <div className="event-desc">{event.description}</div>}
                  </div>
                  <span className={`event-type-badge event-${event.type}`}>{event.type}</span>
                  <div className="task-actions" style={{ opacity: 1 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingEvent(event); setShowForm(true); }} title="Edit">✎</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(event._id)} title="Delete">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
        />
      )}
    </>
  );
};

export default EventsSection;
