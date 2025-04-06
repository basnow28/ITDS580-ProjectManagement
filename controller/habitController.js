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
    const duration = 33;

    const workedDays = Array.from({ length: duration }, (_, i) => ({
      dayNumber: i + 1,
      completed: false,
    }));

    const newHabit = new Habit({
      name,
      userId,
      dailyDuration,
      startDate,
      timeOfWorkingOnTheHabit,
      workedDays,
      duration,
      participants: []
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

exports.getUserHabits = async (req, res, next) => {
  try {
    const userId = req.userId; // Assuming authentication middleware sets req.userId
    const today = new Date();

    // Fetch all habits for the user
    const userHabits = await Habit.find({ userId });

    // Add `active` flag based on whether the habit is still within its 33-day duration
    // Add `future`flag based on whether the habit hasn't started yet
    const formattedHabits = [];
    userHabits.forEach((habit) => {
      const habitStartDate = new Date(habit.startDate);
      const habitEndDate = new Date(habit.startDate);
      habitEndDate.setDate(habitEndDate.getDate() + habit.duration); // Adding 33 days

      formattedHabits.push({
        ...habit.toObject(),
        active: today >= habitStartDate && today < habitEndDate, // true if still within 33-day period
        future: today < habitStartDate // true if the habit start date is a future day
      });
    });

    res.status(200).json({ habits: formattedHabits });
  } catch (error) {
    next(error);
  }
};

exports.updateHabitDayCompletion = async (req, res, next) => {
  try {
    const { habitId, dayNumber } = req.params;
    const { completed } = req.body;

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    if (!Array.isArray(habit.workedDays)) {
      habit.workedDays = Array.from({ length: habit.duration }, (_, i) => ({
        dayNumber: i + 1,
        completed: false,
      }));
    }

    const dayIndex = habit.workedDays.findIndex(
      (day) => day.dayNumber === Number(dayNumber)
    );

    if (dayIndex !== -1) {
      habit.workedDays[dayIndex].completed = completed;
    } else {
      habit.workedDays.push({
        dayNumber: Number(dayNumber),
        completed,
      });
    }

    await habit.save();

    res.status(200).json({
      message: "Habit updated successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};
