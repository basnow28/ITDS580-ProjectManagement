const Notification = require("../model/Notification");

exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    next(error);
  }
};
