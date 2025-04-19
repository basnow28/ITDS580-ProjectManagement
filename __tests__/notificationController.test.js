const Notification = require("../model/Notification");
jest.mock("../model/Notification");

const { getUserNotifications, markNotificationAsRead } = require("../controller/notificationController");

describe("getUserNotifications", () => {
  let req, res, next;

  beforeEach(() => {
    req = { userId: "user123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return notifications for the user", async () => {
    const mockNotifications = [
      {
        _id: "notif1",
        userId: "user123",
        message: "Test Notification",
        createdAt: new Date(),
        type: "REMINDER"
      },
    ];

    Notification.find.mockResolvedValue(mockNotifications);

    await getUserNotifications(req, res, next);

    expect(Notification.find).toHaveBeenCalledWith({ userId: "user123" });
  });
});

describe("markNotificationAsRead", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { notificationId: "notif123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should mark a notification as read and return the updated notification", async () => {
    const updatedNotification = {
      _id: "notif123",
      userId: "user123",
      message: "Test notification",
      type: "REMINDER",
      read: true,
    };

    Notification.findByIdAndUpdate.mockResolvedValue(updatedNotification);

    await markNotificationAsRead(req, res, next);

    expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
      "notif123",
      { read: true },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  });

  it("should return 404 if notification not found", async () => {
    Notification.findByIdAndUpdate.mockResolvedValue(null);

    await markNotificationAsRead(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Notification not found" });
  });

  it("should call next with an error if something goes wrong", async () => {
    const error = new Error("Something went wrong");
    Notification.findByIdAndUpdate.mockRejectedValue(error);

    await markNotificationAsRead(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});