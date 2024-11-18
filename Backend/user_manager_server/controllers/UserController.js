// controllers/UserController.js
const UserModel = require("../models/User");

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }

        // Create a new user without hashing the password
        const newUser = new UserModel({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password." });
        }

        res.status(200).json({ message: "Login successful." });
    } catch (error) {
        res.status(500).json({ error: "Login failed. Please try again." });
    }
};

// Change user password (Placeholder)
exports.changePassword = async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    try {
        // Find the user by username
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the old password matches
        if (user.password !== oldPassword) {
            return res.status(401).json({ error: "Invalid old password." });
        }

        // Update the password (you may want to add hashing here later)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        res.status(500).json({ error: "Password change failed. Please try again." });
    }
};
