const Notification = require("../model/Notification");
jest.mock("../model/Notification");

const { getUserNotifications } = require("../controller/notificationController");

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
