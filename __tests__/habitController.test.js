const Habit = require("../model/Habit");
const Notification = require("../model/Notification");
const { createHabit, getUserHabits, updateHabitDayCompletion, inviteUserToHabit } = require("../controller/habitController");

jest.mock("../model/Habit");
jest.mock("../model/Notification");

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
    const workedDays = Array.from({ length: 33 }, (_, i) => ({
      dayNumber: i + 1,
      completed: false,
    }));
    const mockHabit = {
      save: jest.fn().mockResolvedValue(true),
      ...req.body,
      userId: req.userId,
      participants: [],
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
      workedDays,
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

describe("getUserHabits", () => {
  let req, res, next;

  beforeEach(() => {
    req = { userId: "mockUserId" }; // Mock user ID
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return habits with active and future flags", async () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 40); // Expired habit (40 days ago)
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 10); // Future habit (in 10 days)

    const mockHabits = [
      {
        _id: "1",
        name: "Morning Run",
        startDate: today,
        duration: 33,
        userId: "mockUserId",
        participants: [],
        workedDays: [],
        timeOfWorkingOnTheHabit: "6am",
        toObject: jest.fn().mockReturnValue({
          _id: "1",
          name: "Morning Run",
          startDate: today,
          duration: 33,
          userId: "mockUserId",
          participants: [],
          workedDays: [],
          timeOfWorkingOnTheHabit: "6am",
        }),
      },
      {
        _id: "2",
        name: "Reading",
        startDate: pastDate,
        duration: 33,
        userId: "mockUserId",
        participants: [],
        workedDays: [],
        timeOfWorkingOnTheHabit: "9pm",
        toObject: jest.fn().mockReturnValue({
          _id: "2",
          name: "Reading",
          startDate: pastDate,
          duration: 33,
          userId: "mockUserId",
          participants: [],
          workedDays: [],
          timeOfWorkingOnTheHabit: "9pm",
        }),
      },
      {
        _id: "3",
        name: "Meditation",
        startDate: futureDate,
        duration: 33,
        userId: "mockUserId",
        participants: [],
        workedDays: [],
        timeOfWorkingOnTheHabit: "7am",
        toObject: jest.fn().mockReturnValue({
          _id: "3",
          name: "Meditation",
          startDate: futureDate,
          duration: 33,
          userId: "mockUserId",
          participants: [],
          workedDays: [],
          timeOfWorkingOnTheHabit: "7am",
        }),
      },
    ];

    // Mock Habit.find() to return the test habits
    Habit.find = jest.fn().mockResolvedValue(mockHabits);

    await getUserHabits(req, res, next);

    expect(Habit.find).toHaveBeenCalledWith({
      "$or": [
        {
          userId: "mockUserId",
        },
        {
          participants: "mockUserId",
        }]
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      habits: expect.arrayContaining([
        expect.objectContaining({ name: "Morning Run", active: true, future: false }),
        expect.objectContaining({ name: "Reading", active: false, future: false }),
        expect.objectContaining({ name: "Meditation", active: false, future: true }),
      ]),
    });
  });

  it("should call next() with an error if Habit.find() fails", async () => {
    const error = new Error("Database error");
    Habit.find = jest.fn().mockRejectedValue(error);

    await getUserHabits(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("updateHabitDayCompletion", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {
        habitId: "mockHabitId",
        dayNumber: "2",
      },
      body: {
        completed: true,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should update an existing day in workedDays", async () => {
    const mockHabit = {
      _id: "mockHabitId",
      workedDays: [{ dayNumber: 2, completed: false }],
      save: jest.fn(),
    };

    Habit.findById = jest.fn().mockResolvedValue(mockHabit);

    await updateHabitDayCompletion(req, res, next);

    expect(mockHabit.workedDays[0].completed).toBe(true);
    expect(mockHabit.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Habit updated successfully",
      habit: mockHabit,
    });
  });

  it("should add a new day to workedDays if it does not exist", async () => {
    const mockHabit = {
      _id: "mockHabitId",
      workedDays: [{ dayNumber: 1, completed: true }],
      save: jest.fn(),
    };

    Habit.findById = jest.fn().mockResolvedValue(mockHabit);

    await updateHabitDayCompletion(req, res, next);

    expect(mockHabit.workedDays).toContainEqual({
      dayNumber: 2,
      completed: true,
    });
    expect(mockHabit.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if habit is not found", async () => {
    Habit.findById = jest.fn().mockResolvedValue(null);

    await updateHabitDayCompletion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Habit not found" });
  });

  it("should call next with error if something goes wrong", async () => {
    const error = new Error("Something went wrong");
    Habit.findById = jest.fn().mockRejectedValue(error);

    await updateHabitDayCompletion(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("inviteUserToHabit", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { habitId: "habit123" },
      body: { invitedUserId: "user456" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("should return 404 if habit not found", async () => {
    Habit.findById.mockResolvedValue(null);

    await inviteUserToHabit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Habit not found" });
  });

  it("should return 400 if user is already a participant", async () => {
    Habit.findById.mockResolvedValue({
      participants: ["user456"],
      pendingInvites: [],
    });

    await inviteUserToHabit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already invited or participating",
    });
  });

  it("should return 400 if user was already invited", async () => {
    Habit.findById.mockResolvedValue({
      participants: [],
      pendingInvites: ["user456"],
    });

    await inviteUserToHabit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already invited or participating",
    });
  });

  it("should add user to pendingInvites and send a notification", async () => {
    const mockSave = jest.fn();
    Habit.findById.mockResolvedValue({
      _id: "habit123",
      name: "Morning Run",
      participants: [],
      pendingInvites: [],
      save: mockSave,
    });

    const mockNotificationSave = jest.fn();
    Notification.mockImplementation(() => ({
      save: mockNotificationSave,
    }));

    await inviteUserToHabit(req, res, next);

    expect(mockSave).toHaveBeenCalled();
    expect(mockNotificationSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User invited successfully",
    });
  });

  it("should call next with error if something goes wrong", async () => {
    const error = new Error("DB error");
    Habit.findById.mockRejectedValue(error);

    await inviteUserToHabit(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});