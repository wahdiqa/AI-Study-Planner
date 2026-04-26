const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "AI Study Planner API is running 🚀" });
});

// ── Error handler (must be last middleware) ───────────────────────────────────
app.use(require("./middleware/errorHandler"));

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
