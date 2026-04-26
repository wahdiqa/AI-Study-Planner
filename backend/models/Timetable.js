const mongoose = require("mongoose");

const timeBlockSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:30"
  subject: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  color: { type: String, default: "#6366f1" },
});

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
      unique: true,
    },
    blocks: [timeBlockSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
