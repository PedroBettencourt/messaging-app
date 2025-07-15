const express = require('express');
const { body, validationResult } = require("express-validator");
const db = require("./prisma/queries");
const passport = require('passport');
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const index = express.Router();


// Register new user
validateUser = [
    body("username")
        .exists()
        .trim()
        .matches(/^[a-zA-Z0-9]{3,}$/)
        .withMessage("Invalid username"),
    body("password")
        .exists()
        .trim()
        .isLength({ min: 6 })
        .withMessage("Invalid password"),
    body("bio")
        .trim()
        .isLength({ max: 200 }).withMessage("Bio is too long (plus 200 characters)")
        .matches(/^[a-zA-Z0-9 -]*$/)
        .withMessage("Invalid bio"),
];

index.post("/register", validateUser, async (req, res) => {
    // Validate username, password, and bio
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { username, password, passwordRepeat, bio } = req.body;

    // Check if username already exists
    const checkUser = await db.getUser(username);
    if (checkUser) return res.status(400).json("username already exists");

    // Check if passwords match
    if (password !== passwordRepeat) return res.status(400).json("passwords don't match");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.addUser(username, hashedPassword, bio);
    return res.json({ username: user.username, bio: user.bio });
});


// Login
validateLogin = [
    body("username")
        .exists()
        .trim()
        .matches(/^[a-zA-Z0-9]{3,}$/)
        .withMessage("Invalid username"),
    body("password")
        .exists()
        .trim()
        .isLength({ min: 6 })
        .withMessage("Invalid password"),
];

index.post("/login", validateLogin, async (req, res) => {
    // Validate username and password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    };

    const { username, password } = req.body;
    const user = await db.getUser(username);

    if (!user) return res.status(400).json("Username does not exist");

    const pass = await bcrypt.compare(password, user.password);
    if (!pass) return res.status(400).json("Wrong password");

    const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token: token, username: user.username });
});


// Update user bio
validateBio = [
    body("bio")
        .trim()
        .isLength({ max: 200 }).withMessage("Bio is too long (plus 200 characters)")
        .matches(/^[a-zA-Z0-9 -]*$/)
        .withMessage("Invalid bio"),
];

index.put("/update", 
    passport.authenticate("jwt", { session: false }), 
    validateBio, 
    async (req, res) => {
        // Validate bio
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        // Username comes from the token (req.user)
        const { bio } = req.body;
        
        const user = await db.updateUserBio(req.user, bio);
        return res.json({ username: user.username, bio: user.bio });
});


// Profile
index.get("/:username", async (req, res) => {
    const username = req.params.username;
    const profile = await db.getUser(username);

    if (!profile) return res.status(400).json("No username found");
    
    return res.json({ username: profile.username, bio: profile.bio });

    // Probably get people who they've talked in order of most recent;
})


module.exports = index;