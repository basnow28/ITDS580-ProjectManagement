require('dotenv').config();
require("./jobs/reminderJob");
const express = require('express');
const mongoose = require('mongoose');

const habitRoutes = require('./routes/habitRoutes');
const authorizeMiddleware = require('./auth/authMiddleware');

const app = express();

const main = async () => {
  await mongoose.connect(process.env.MONGO_DB);
};

main()
  .then(res => console.log(res))
  .catch(err => console.log(err));

//Body parser
app.use(express.json());

app.use(authorizeMiddleware);

app.use("/api/habits", habitRoutes)

app.listen(8080, () => console.log("listening on port 8080"));