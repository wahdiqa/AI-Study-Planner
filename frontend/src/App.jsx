import React, { useState, useEffect, useCallback } from "react";
import Sidebar     from "./components/Sidebar";
import TaskList    from "./components/TaskList";
import EventsSection from "./components/EventsSection";
import Timetable   from "./components/Timetable";
import Chatbot     from "./components/Chatbot";
import Dashboard   from "./pages/Dashboard";
import Auth        from "./pages/Auth";
import { ToastProvider, useToast } from "./context/ToastContext";
import { taskAPI, eventAPI, timetableAPI } from "./services/api";

// ── Inner app that can use the toast hook ─────────────────────────────────────
const AppInner = () => {
  const toast = useToast();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [section, setSection] = useState("dashboard");

  const [tasks,     setTasks]     = useState([]);
  const [events,    setEvents]    = useState([]);
  const [schedule,  setSchedule]  = useState([]);

  const [loadingTasks,    setLoadingTasks]    = useState(true);
  const [loadingEvents,   setLoadingEvents]   = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const { data } = await taskAPI.getAll();
      setTasks(data.data);
    } catch {
      toast("Failed to load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const { data } = await eventAPI.getAll();
      setEvents(data.data);
    } catch {
      toast("Failed to load events", "error");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoadingSchedule(true);
      const { data } = await timetableAPI.getAll();
      setSchedule(data.data);
    } catch {
      toast("Failed to load schedule", "error");
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  // Called by Chatbot whenever it performs an action
  const refreshAllData = useCallback(() => {
    fetchTasks();
    fetchEvents();
  }, [fetchTasks, fetchEvents]);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
    fetchSchedule();
  }, []);

  // ── Task handlers ───────────────────────────────────────────────────────────
  const handleAddTask = async (formData) => {
    try {
      const { data } = await taskAPI.create(formData);
      setTasks((prev) => [data.data, ...prev]);
      toast("Task added!");
    } catch {
      toast("Failed to add task", "error");
    }
  };

  const handleEditTask = async (id, formData) => {
    try {
      const { data } = await taskAPI.update(id, formData);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)));
      toast("Task updated!");
    } catch {
      toast("Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast("Task deleted");
    } catch {
      toast("Failed to delete task", "error");
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const { data } = await taskAPI.toggle(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)));
    } catch {
      toast("Failed to update task", "error");
    }
  };

  // ── Event handlers ──────────────────────────────────────────────────────────
  const handleAddEvent = async (formData) => {
    try {
      const { data } = await eventAPI.create(formData);
      setEvents((prev) => [...prev, data.data]);
      toast("Event added!");
    } catch {
      toast("Failed to add event", "error");
    }
  };

  const handleEditEvent = async (id, formData) => {
    try {
      const { data } = await eventAPI.update(id, formData);
      setEvents((prev) => prev.map((e) => (e._id === id ? data.data : e)));
      toast("Event updated!");
    } catch {
      toast("Failed to update event", "error");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await eventAPI.delete(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast("Event deleted");
    } catch {
      toast("Failed to delete event", "error");
    }
  };

  // ── Timetable handlers ──────────────────────────────────────────────────────
  const handleUpsertDay = async (payload) => {
    try {
      const { data } = await timetableAPI.upsertDay(payload);
      setSchedule((prev) => {
        const exists = prev.find((s) => s.day === data.data.day);
        if (exists) return prev.map((s) => (s.day === data.data.day ? data.data : s));
        return [...prev, data.data];
      });
      toast("Schedule saved!");
    } catch {
      toast("Failed to save schedule", "error");
    }
  };

  // ── Page title map ──────────────────────────────────────────────────────────
  const PAGE_INFO = {
    dashboard: { title: "Dashboard",   subtitle: "Your study command centre" },
    tasks:     { title: "Tasks",       subtitle: "Manage your pending and completed tasks" },
    timetable: { title: "Timetable",   subtitle: "Build your weekly study schedule" },
    events:    { title: "Events",      subtitle: "Track exams, deadlines and important dates" },
  };

  const { title, subtitle } = PAGE_INFO[section];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast("Logged out successfully");
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeSection={section} onNav={setSection} onLogout={handleLogout} user={user} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* ── Dashboard ─────────────────────────────────────────────────── */}
        {section === "dashboard" && (
          <Dashboard
            tasks={tasks}
            events={events}
            onNav={setSection}
          />
        )}

        {/* ── Tasks ────────────────────────────────────────────────────── */}
        {section === "tasks" && (
          <div className="dashboard-grid">
            <TaskList
              tasks={tasks}
              loading={loadingTasks}
              onToggle={handleToggleTask}
              onAdd={handleAddTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {/* ── Timetable ─────────────────────────────────────────────────── */}
        {section === "timetable" && (
          <Timetable
            schedule={schedule}
            loading={loadingSchedule}
            onUpsertDay={handleUpsertDay}
          />
        )}

        {/* ── Events ───────────────────────────────────────────────────── */}
        {section === "events" && (
          <EventsSection
            events={events}
            loading={loadingEvents}
            onAdd={handleAddEvent}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </main>

      {/* Chatbot always visible */}
      <Chatbot onDataChange={refreshAllData} />
    </div>
  );
};

// ── Root export wrapped in providers ─────────────────────────────────────────
const App = () => (
  <ToastProvider>
    <AppInner />
  </ToastProvider>
);

export default App;
