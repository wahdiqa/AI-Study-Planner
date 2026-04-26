import React from "react";

const NAV_ITEMS = [
  { key: "dashboard", icon: "◆", label: "Dashboard" },
  { key: "tasks",     icon: "▣", label: "Tasks" },
  { key: "timetable", icon: "▥",  label: "Timetable" },
  { key: "events",    icon: "◈", label: "Events" },
];

const Sidebar = ({ activeSection, onNav, onLogout, user }) => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <h1>
        <span className="logo-icon">✧</span>
        <span>StudyPlanner</span>
      </h1>
    </div>

    <nav className="sidebar-nav">
      {NAV_ITEMS.map(({ key, icon, label }) => (
        <button
          key={key}
          className={`nav-item ${activeSection === key ? "active" : ""}`}
          onClick={() => onNav(key)}
        >
          <span className="nav-icon">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>

    <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ color: "var(--text-primary)" }}>{user?.name || "User"}</div>
      <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ width: "100%", justifyContent: "center" }}>
        Log Out
      </button>
    </div>
  </aside>
);

export default Sidebar;
