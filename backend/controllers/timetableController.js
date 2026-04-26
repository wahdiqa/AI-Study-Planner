const Timetable = require("../models/Timetable");

// ── GET /api/timetable ────────────────────────────────────────────────────────
const getTimetable = async (req, res) => {
  try {
    const schedule = await Timetable.find().sort({ day: 1 });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/timetable ───────────────────────────────────────────────────────
// Creates or replaces the schedule for a given day
const upsertDay = async (req, res) => {
  try {
    const { day, blocks } = req.body;

    if (!day) {
      return res.status(400).json({ success: false, message: "Day is required" });
    }

    const schedule = await Timetable.findOneAndUpdate(
      { day },
      { day, blocks: blocks || [] },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── PUT /api/timetable/:id ────────────────────────────────────────────────────
const updateDay = async (req, res) => {
  try {
    const schedule = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/timetable/:id ─────────────────────────────────────────────────
const deleteDay = async (req, res) => {
  try {
    const schedule = await Timetable.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    res.json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTimetable, upsertDay, updateDay, deleteDay };
