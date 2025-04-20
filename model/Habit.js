const mongoose = require("mongoose")

const HabitSchema = new mongoose.Schema({
  name: String,
  userId: String,
  dailyDuration: String,
  startDate: Date,
  timeOfWorkingOnTheHabit: String,
  workedDays: Array,
  duration: Number,
  participants: Array,
  pendingInvites: Array,
})

module.exports = mongoose.model('Habit', HabitSchema);