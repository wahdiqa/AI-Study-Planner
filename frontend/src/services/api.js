import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// ── Tasks ────────────────────────────────────────────────────────────────────
export const taskAPI = {
  getAll:  ()          => API.get("/tasks"),
  create:  (data)      => API.post("/tasks", data),
  update:  (id, data)  => API.put(`/tasks/${id}`, data),
  delete:  (id)        => API.delete(`/tasks/${id}`),
  toggle:  (id)        => API.patch(`/tasks/${id}/toggle`),
};

// ── Events ───────────────────────────────────────────────────────────────────
export const eventAPI = {
  getAll:  ()          => API.get("/events"),
  create:  (data)      => API.post("/events", data),
  update:  (id, data)  => API.put(`/events/${id}`, data),
  delete:  (id)        => API.delete(`/events/${id}`),
};

// ── Timetable ────────────────────────────────────────────────────────────────
export const timetableAPI = {
  getAll:    ()        => API.get("/timetable"),
  upsertDay: (data)    => API.post("/timetable", data),
  updateDay: (id, data)=> API.put(`/timetable/${id}`, data),
  deleteDay: (id)      => API.delete(`/timetable/${id}`),
};

// ── Chatbot ──────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  send: (message, history) => API.post("/chatbot", { message, history }),
};

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
};
