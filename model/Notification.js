const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: String,
  habitId: mongoose.Schema.Types.ObjectId,
  message: String,
  type: { type: String, default: "REMINDER" },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);