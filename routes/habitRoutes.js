const express = require("express")
const router = express.Router();
const habitController = require("../controller/habitController");

router.get("/ok", habitController.ok);
router.post("", habitController.createHabit);
router.get("", habitController.getUserHabits)
router.put("/:habitId/day/:dayNumber/completed", habitController.updateHabitDayCompletion)

module.exports = router