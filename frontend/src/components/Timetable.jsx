import React, { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COLORS = ["#5b8dee", "#9b7fe8", "#4ecb7f", "#f0a04b", "#e05c5c", "#5bbee0"];

const BlockForm = ({ block, onSubmit, onClose }) => {
  const [form, setForm] = useState(
    block
      ? { ...block }
      : { startTime: "09:00", endTime: "10:00", subject: "", description: "", color: COLORS[0] }
  );

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{block ? "Edit Block" : "Add Time Block"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input className="form-control" name="subject" value={form.subject} onChange={handleChange} autoFocus placeholder="e.g. Mathematics" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input className="form-control" type="time" name="startTime" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input className="form-control" type="time" name="endTime" value={form.endTime} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid var(--text-primary)" : "2px solid transparent",
                    cursor: "pointer", transition: "all 150ms",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Optional notes" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{block ? "Save" : "Add Block"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Timetable = ({ schedule, loading, onUpsertDay }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const getBlocks = (day) => {
    const entry = schedule.find((s) => s.day === day);
    return entry ? entry.blocks : [];
  };

  const handleAddBlock = (day) => {
    setActiveDay(day);
    setEditingBlock(null);
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEditBlock = (day, block, index) => {
    setActiveDay(day);
    setEditingBlock(block);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleFormSubmit = (blockData) => {
    const blocks = [...getBlocks(activeDay)];
    if (editingIndex !== null) {
      blocks[editingIndex] = blockData;
    } else {
      blocks.push(blockData);
    }
    blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    onUpsertDay({ day: activeDay, blocks });
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
          <h2 className="card-title">▥ Weekly Schedule</h2>
        </div>

        <div className="timetable-grid">
          {DAYS.map((day) => {
            const blocks = getBlocks(day);
            return (
              <div key={day} className="day-column">
                <div className={`day-header ${day === todayName ? "today" : ""}`}>
                  {day.slice(0, 3)}
                </div>
                {blocks.map((block, i) => (
                  <div
                    key={i}
                    className="time-block"
                    style={{ borderLeftColor: block.color || "var(--purple)" }}
                    onClick={() => handleEditBlock(day, block, i)}
                  >
                    <div className="time-block-time">{block.startTime} – {block.endTime}</div>
                    <div className="time-block-subject">{block.subject}</div>
                  </div>
                ))}
                <button className="add-block-btn" onClick={() => handleAddBlock(day)}>
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <BlockForm
          block={editingBlock}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setActiveDay(null); setEditingBlock(null); setEditingIndex(null); }}
        />
      )}
    </>
  );
};

export default Timetable;
