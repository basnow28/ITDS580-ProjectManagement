const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

router.get("/", notificationController.getUserNotifications);

module.exports = router;