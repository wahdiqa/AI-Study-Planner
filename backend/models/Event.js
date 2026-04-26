const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    type: {
      type: String,
      enum: ["exam", "school", "personal", "deadline", "other"],
      default: "other",
    },
    important: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
