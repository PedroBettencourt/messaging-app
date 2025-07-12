const express = require('express');
const { body, validationResult } = require("express-validator");

const index = express.Router();

index.get("/", (req, res) => {
    res.send("hi");
});

module.exports = index;