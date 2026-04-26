const express = require("express");
const router = express.Router();
const { getTimetable, upsertDay, updateDay, deleteDay } = require("../controllers/timetableController");

router.route("/").get(getTimetable).post(upsertDay);
router.route("/:id").put(updateDay).delete(deleteDay);

module.exports = router;
