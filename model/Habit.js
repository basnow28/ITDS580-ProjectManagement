const mongoose = require("mongoose")

const Habit = new mongoose.Schema({
  name: String,
  userId: String,
  dailyDuration: String,
  startDate: Date,
  timeOfWorkingOnTheHabit: String,
  workedDays: Array, //Array representing the indexes of the days the user worked on the habit
  duration: Number,
  participants: Array,
})

module.exports = mongoose.model('Habit', Habit);