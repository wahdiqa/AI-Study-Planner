// ── routes/taskRoutes.js ──────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
} = require("../controllers/taskController");

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);
router.patch("/:id/toggle", toggleComplete);

module.exports = router;
