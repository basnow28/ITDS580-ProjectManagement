const express = require("express")
const router = express.Router();
const habitController = require("../controller/habitController");

router.get("", habitController.ok);

module.exports = router