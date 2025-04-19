const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

router.get("/", notificationController.getUserNotifications);
router.put("/:notificationId/read", notificationController.markNotificationAsRead);

module.exports = router;