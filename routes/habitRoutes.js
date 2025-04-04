const express = require("express")
const router = express.Router();
const habitController = require("../controller/habitController");

router.get("/ok", habitController.ok);
router.post("", habitController.createHabit);
router.get("", habitController.getUserHabits)

module.exports = router