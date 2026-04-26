import React from "react";

const StatCard = ({ label, value, colorClass, icon }) => (
  <div className="stat-card">
    <div className="stat-label">{icon} {label}</div>
    <div className={`stat-value ${colorClass}`}>{value}</div>
  </div>
);

const Dashboard = ({ tasks, events, onNav }) => {
  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const highPrio  = pending.filter((t) => t.priority === "high");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const overdueTasks = pending.filter(
    (t) => t.deadline && new Date(t.deadline) < today
  );

  const dueSoon = pending.filter((t) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return d >= today && d <= new Date(today.getTime() + 3 * 86400000);
  });

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const topTasks = [...pending]
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);

  return (
    <div>
      {/* Stats */}
      <div className="stats-row">
        <StatCard icon="▣" label="Pending Tasks"    value={pending.length}        colorClass="accent" />
        <StatCard icon="◆" label="Completed"         value={completed.length}       colorClass="green"  />
        <StatCard icon="◈" label="High Priority"    value={highPrio.length}        colorClass="blue"   />
        <StatCard icon="▥" label="Upcoming Events"  value={upcomingEvents.length}  colorClass="purple" />
      </div>

      {/* Alert banners */}
      {overdueTasks.length > 0 && (
        <div style={{
          background: "var(--red-dim)", border: "1px solid var(--red)",
          borderRadius: "var(--radius-md)", padding: "12px 16px",
          marginBottom: "20px", fontSize: "0.875rem", color: "var(--red)",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <span style={{ fontSize: "1.1rem" }}>▲</span>
          <span>
            <strong>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}!</strong>{" "}
            {overdueTasks.map((t) => t.title).join(", ")}
          </span>
          <button
            className="btn btn-sm"
            style={{ marginLeft: "auto", background: "var(--red)", color: "white", border: "none" }}
            onClick={() => onNav("tasks")}
          >
            View Tasks
          </button>
        </div>
      )}

      {/* Two-column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Today's Focus */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">✧ Today's Focus</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("tasks")}>
              View all →
            </button>
          </div>

          {topTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✧</div>
              <div className="empty-text">No pending tasks — you're all caught up!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {topTasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  }}
                >
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: task.priority === "high" ? "var(--red)" : task.priority === "medium" ? "var(--accent)" : "var(--green)"
                  }} />
                  <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {task.title}
                  </span>
                  {task.subject && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{task.subject}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">▥ Coming Up</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("events")}>
              View all →
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◇</div>
              <div className="empty-text">No upcoming events scheduled.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {upcomingEvents.map((event) => {
                const d   = new Date(event.date);
                const diff = Math.floor((d - today) / 86400000);
                const when = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
                return (
                  <div
                    key={event._id}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                      borderLeft: `3px solid ${event.color || "var(--accent)"}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {event.important && "✦ "}{event.title}
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "99px",
                      background: diff === 0 ? "var(--red-dim)" : diff <= 3 ? "var(--accent-dim)" : "var(--bg-surface)",
                      color: diff === 0 ? "var(--red)" : diff <= 3 ? "var(--accent)" : "var(--text-muted)",
                    }}>
                      {when}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Progress + Due Soon row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>

        {/* Completion Progress */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⧉ Progress</h2>
          </div>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%", margin: "0 auto 16px",
              background: `conic-gradient(var(--accent) ${completionRate * 3.6}deg, var(--bg-elevated) 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "inset 0 0 0 14px var(--bg-surface), 0 0 20px var(--accent-glow)",
              position: "relative",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", textShadow: "0 0 10px var(--accent-glow)" }}>
                {completionRate}%
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {completed.length} of {tasks.length} tasks completed
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            {[
              { label: "High", count: tasks.filter(t => t.priority === "high" && t.completed).length, total: tasks.filter(t => t.priority === "high").length, color: "var(--red)" },
              { label: "Medium", count: tasks.filter(t => t.priority === "medium" && t.completed).length, total: tasks.filter(t => t.priority === "medium").length, color: "var(--accent)" },
              { label: "Low", count: tasks.filter(t => t.priority === "low" && t.completed).length, total: tasks.filter(t => t.priority === "low").length, color: "var(--green)" },
            ].map(({ label, count, total, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", width: "48px" }}>{label}</span>
                <div style={{ flex: 1, height: "6px", borderRadius: "99px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                  <div style={{
                    width: `${total === 0 ? 0 : (count / total) * 100}%`,
                    height: "100%", background: color, borderRadius: "99px",
                    transition: "width 600ms ease",
                  }} />
                </div>
                <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", width: "32px", textAlign: "right" }}>
                  {count}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Due Soon */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">◴ Due Soon <span className="card-count">Next 3 days</span></h2>
          </div>
          {dueSoon.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✧</div>
              <div className="empty-text">Nothing due in the next 3 days. Stay ahead!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {dueSoon.map((task) => {
                const d    = new Date(task.deadline);
                const diff = Math.floor((d - today) / 86400000);
                const when = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `${diff} days`;
                return (
                  <div key={task._id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{task.title}</div>
                      {task.subject && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{task.subject}</div>}
                    </div>
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                    <span style={{
                      fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px",
                      borderRadius: "99px",
                      background: diff === 0 ? "var(--red-dim)" : "var(--accent-dim)",
                      color:      diff === 0 ? "var(--red)"     : "var(--accent)",
                    }}>
                      {when}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
