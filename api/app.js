const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Authentication
const initPassport = require('./passport');
initPassport();

// Routes
const indexRouter = require("./index");
app.use("/", indexRouter);

app.listen(process.env.PORT || 3000)