// jobs/reminderJob.js
const cron = require("node-cron");
const Habit = require("../model/Habit");
const Notification = require("../model/Notification");

async function checkHabitsAndNotify() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const habits = await Habit.find();

    for (const habit of habits) {
      const habitStart = new Date(habit.startDate);
      habitStart.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((today - habitStart) / (1000 * 60 * 60 * 24)) + 1;

      if (dayDiff < 1 || dayDiff > habit.duration) continue;

      const todayEntry = habit.workedDays.find((d) => d.dayNumber === dayDiff);
      if (!todayEntry || !todayEntry.completed) {
        await Notification.create({
          userId: habit.userId,
          habitId: habit._id,
          message: `You haven’t completed your habit "${habit.name}" for day ${dayDiff}.`,
          createdAt: new Date(),
          type: "REMINDER",
        });
      }
    }
  } catch (err) {
    console.error("Error in reminder job:", err);
    throw err;
  }
}

cron.schedule("0 18 * * *", () => {
  console.log("⏰ Running scheduled habit reminder job...");
  checkHabitsAndNotify();
});

// ✅ Export the function for testing
module.exports = { checkHabitsAndNotify };
