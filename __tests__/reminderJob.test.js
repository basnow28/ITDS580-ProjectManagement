const { checkHabitsAndNotify } = require("../jobs/reminderJob");
const Habit = require("../model/Habit");
const Notification = require("../model/Notification");

jest.mock("../model/Habit");
jest.mock("../model/Notification");

describe("checkHabitsAndNotify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send a reminder if the habit is not completed today", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 1); // Habit started yesterday

    const mockHabit = {
      _id: "habit123",
      name: "Drink Water",
      userId: "user1",
      startDate,
      duration: 33,
      workedDays: [{ dayNumber: 1, completed: true }]
    };

    Habit.find.mockResolvedValue([mockHabit]);
    Notification.create.mockResolvedValue({});

    await checkHabitsAndNotify();

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        habitId: "habit123",
        message: expect.stringContaining("Drink Water"),
        type: "REMINDER"
      })
    );
  });

  it("should not send a reminder if the habit is completed today", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 1); // Habit started yesterday

    const mockHabit = {
      _id: "habit123",
      name: "Read Book",
      userId: "user2",
      startDate,
      duration: 33,
      workedDays: [
        { dayNumber: 1, completed: true },
        { dayNumber: 2, completed: true } // today
      ]
    };

    Habit.find.mockResolvedValue([mockHabit]);
    Notification.create.mockResolvedValue({});

    await checkHabitsAndNotify();

    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("should skip if the startDate is in the future", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    const mockHabit = {
      _id: "habitFuture",
      name: "Future Habit",
      userId: "user3",
      startDate: futureDate,
      duration: 33,
      workedDays: []
    };

    Habit.find.mockResolvedValue([mockHabit]);
    Notification.create.mockResolvedValue({});

    await checkHabitsAndNotify();

    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("should throw an error if database fails", async () => {
    const error = new Error("DB error");
    Habit.find.mockRejectedValue(error);

    await expect(checkHabitsAndNotify()).rejects.toThrow("DB error");
  });
});
