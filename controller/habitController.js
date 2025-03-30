const Habit = require("../model/Habit");

exports.ok = async (req, res, next) => {
  res.status(200).json({
    response: "ok"
  });
}

exports.createHabit = async (req, res, next) => {
  try {
    const { name, dailyDuration, startDate, timeOfWorkingOnTheHabit } = req.body;
    const userId = req.userId;

    const newHabit = new Habit({
      name,
      userId,
      dailyDuration,
      startDate,
      timeOfWorkingOnTheHabit,
      participants: [],
      workedDays: [],
      duration: 33
    });

    await newHabit.save();

    res.status(201).json({
      message: "Habit created successfully",
      habit: newHabit,
    });
  } catch (error) {
    next(error);
  }
}