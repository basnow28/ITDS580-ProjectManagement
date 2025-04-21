const express = require("express")
const router = express.Router();
const habitController = require("../controller/habitController");

router.get("/ok", habitController.ok);
router.post("", habitController.createHabit);
router.get("", habitController.getUserHabits)
router.put("/:habitId/day/:dayNumber/completed", habitController.updateHabitDayCompletion)
router.post("/:habitId/invite", habitController.inviteUserToHabit)
router.post("/:habitId/respond", habitController.respondToHabitInvite)

module.exports = router