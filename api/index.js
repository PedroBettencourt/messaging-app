const express = require('express');
const { body, validationResult } = require("express-validator");
const db = require("./prisma/queries");
const passport = require('passport');
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const index = express.Router();


// Send token
index.get("/protected", 
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        return res.json(req.user);
    }
);


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
        .matches(/^[a-zA-Z0-9 -]*$/)
        .withMessage("Invalid password"),
    body("bio")
        .trim()
        .isLength({ max: 200 }).withMessage("Bio is too long (plus 200 characters)")
        .matches(/^[a-zA-Z0-9 -.!?]*$/)
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
    if (checkUser) return res.status(400).json({errors: [ { msg: "username already exists" } ] });

    // Check if passwords match
    if (password !== passwordRepeat) return res.status(400).json({errors: [ { msg: "passwords don't match" } ] });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.addUser(username, hashedPassword, bio);
    return res.json({ username: user.username, bio: user.bio });
});


// Login
validateLogin = [
    body("username")
        .exists()
        .trim()
        .matches(/^[a-zA-Z0-9]*$/)
        .withMessage("Invalid username"),
    body("password")
        .exists()
        .trim()
        .matches(/^[a-zA-Z0-9 -]*$/)
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

    if (!user) return res.status(400).json({errors: [ { msg: "Username does not exist" } ] });

    const pass = await bcrypt.compare(password, user.password);
    if (!pass) return res.status(400).json({errors: [ { msg: "Wrong password" } ] });

    const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token: token, username: user.username });
});


// Update user bio
validateBio = [
    body("bio")
        .trim()
        .isLength({ max: 200 }).withMessage("Bio is too long (plus 200 characters)")
        .matches(/^[a-zA-Z0-9 -.!?]*$/)
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


// Send message
const validateMessage = [
    body("recipient")
        .exists()
        .trim()
        .matches(/^[a-zA-Z0-9]{3,}$/)
        .withMessage("Invalid username"),
    body("content")
        .exists()
        .trim()
        .isLength({ max: 500 }).withMessage("Message is too long (plus 500 characters)")
        .matches(/^[a-zA-Z0-9 -]*$/)
        .withMessage("Invalid message"),
];

index.post("/message", 
    passport.authenticate("jwt", { session: false }),
    validateMessage,
    async (req, res) => {
        // Validate recipient and content
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const author = req.user;
        const authorDb = await db.getUser(author);

        const { recipient, content } = req.body;

        // Check if there is a recipient in the database
        const recipientDb = await db.getUser(recipient);
        if (!recipientDb) return res.status(400).json("No recipient found");

        // Send message
        const message = await db.sendMessage(authorDb.id, recipientDb.id, content);
        return res.json(message);
    }
);


// Get contacts
index.get("/contacts",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const username = req.user;
        const user = await db.getUser(username);

        const data = await db.getContacts(user.id);
        const contacts = data.map(contact => contact.recipient.username);
        return res.json(contacts);
    }
);


// Get messages from a contact
index.get("/messages/:username",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const username = req.user;
        const user = await db.getUser(username);

        const senderUsername = req.params.username;
        const sender = await db.getUser(senderUsername);

        const messages = await db.getMessages(user.id, sender.id);
        return res.json(messages);
    }
);


// Profile
index.get("/:username", async (req, res) => {
    const username = req.params.username;
    const profile = await db.getUser(username);

    if (!profile) return res.status(400).json("No username found");
    
    return res.json({ username: profile.username, bio: profile.bio });

    // Probably get people who they've talked in order of most recent;
});

module.exports = index;