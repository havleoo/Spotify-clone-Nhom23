// routes/UserRoutes.js
const express = require("express");
const { registerUser, loginUser, changePassword } = require("../controllers/UserController");

const router = express.Router();

// Registration route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Change password route
router.post("/change-password", changePassword);

module.exports = router;
