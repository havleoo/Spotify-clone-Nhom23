const User = require("../models/User");

// Register a new user
exports.registerUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

// Find user by username
exports.findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

// Update user's password
exports.updatePassword = async (username, newPassword) => {
    return await User.findOneAndUpdate(
        { username },
        { password: newPassword },
        { new: true }
    );
};

// Delete user's password (not typically a common operation, but included here)
exports.deletePassword = async (username) => {
    return await User.findOneAndUpdate(
        { username },
        { password: null },
        { new: true }
    );
};
