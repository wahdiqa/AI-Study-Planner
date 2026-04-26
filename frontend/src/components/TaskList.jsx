import React, { useState } from "react";
import TaskForm from "./TaskForm";

const TaskList = ({ tasks, loading, onToggle, onAdd, onEdit, onDelete }) => {
  const [tab, setTab] = useState("pending");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const list      = tab === "pending" ? pending : completed;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingTask) {
      onEdit(editingTask._id, formData);
    } else {
      onAdd(formData);
    }
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="card col-span-2">
        <div className="loading-overlay"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <>
      <div className="card col-span-2">
        <div className="card-header">
          <h2 className="card-title">
            ▣ Tasks <span className="card-count">{tasks.length}</span>
          </h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowForm(true); }}>
            + Add Task
          </button>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
            Pending ({pending.length})
          </button>
          <button className={`tab ${tab === "completed" ? "active" : ""}`} onClick={() => setTab("completed")}>
            Completed ({completed.length})
          </button>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{tab === "pending" ? "✧" : "◇"}</div>
            <div className="empty-text">
              {tab === "pending" ? "No pending tasks — you're all caught up!" : "No completed tasks yet."}
            </div>
          </div>
        ) : (
          <div className="task-list">
            {list.map((task) => {
              const isOverdue = task.deadline && new Date(task.deadline) < today && !task.completed;
              return (
                <div key={task._id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  <button className="task-checkbox" onClick={() => onToggle(task._id)}>
                    {task.completed ? "✓" : ""}
                  </button>
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                      {task.subject && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{task.subject}</span>
                      )}
                      {task.deadline && (
                        <span className={`task-deadline ${isOverdue ? "overdue" : ""}`}>
                          ▥ {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(task)} title="Edit">✎</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task._id)} title="Delete">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </>
  );
};

export default TaskList;
