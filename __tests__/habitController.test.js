const Habit = require("../model/Habit");
const { createHabit } = require("../controller/habitController");

jest.mock("../model/Habit");

describe("createHabit", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        name: "Morning Run",
        dailyDuration: "30 minutes",
        startDate: "2024-03-01",
        timeOfWorkingOnTheHabit: "18:00"
      },
      userId: "user123"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it("should create a new habit and return 201 status", async () => {
    const mockHabit = {
      save: jest.fn().mockResolvedValue(true),
      ...req.body,
      userId: req.userId,
      participants: [],
      workedDays: [],
      duration: 33
    };

    Habit.mockImplementation(() => mockHabit);

    await createHabit(req, res, next);

    expect(Habit).toHaveBeenCalledWith({
      name: "Morning Run",
      dailyDuration: "30 minutes",
      startDate: "2024-03-01",
      timeOfWorkingOnTheHabit: "18:00",
      userId: "user123",
      participants: [],
      workedDays: [],
      duration: 33
    });
    expect(mockHabit.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Habit created successfully",
      habit: mockHabit
    });
  });

  it("should call next with an error if saving fails", async () => {
    const error = new Error("Database error");
    Habit.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(error) }));

    await createHabit(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
