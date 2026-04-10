const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
    const { name, email, phone, password } = req.body;

    console.log("Registration attempt:", { name, email, phone, password: password ? "***" : undefined });

    if (!name || !email || !password) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Name, email and password are required." });
    }

    try {
        console.log("Checking for existing user...");
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log("User already exists with email:", email.toLowerCase());
            return res.status(400).json({ message: "Email is already registered." });
        }

        console.log("Creating new user...");
        const user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            password
        });

        console.log("Saving user to database...");
        const savedUser = await user.save();
        console.log("User saved successfully with ID:", savedUser._id);
        const token = savedUser.generateAuthToken();
        return res.status(201).json({
            message: "Registration successful.",
            token,
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Registration failed.", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", { email, password: password ? "***" : undefined });

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        console.log("Searching for user with email:", email.toLowerCase());
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log("❌ User not found in database for email:", email.toLowerCase());
            console.log("Available users in DB - check server logs");
            return res.status(401).json({ message: "Invalid credentials." });
        }

        console.log("✅ User found in database:", user.email);
        console.log("User data:", { id: user._id, name: user.name, email: user.email, hasPassword: !!user.password });

        console.log("Attempting password comparison...");
        const passwordMatch = await user.comparePassword(password);
        console.log("Password match result:", passwordMatch);

        if (!passwordMatch) {
            console.log("❌ Password does not match for user:", user.email);
            return res.status(401).json({ message: "Invalid credentials." });
        }

        console.log("✅ Password matched! Generating token...");
        const token = user.generateAuthToken();
        console.log("✅ Login successful for user:", user.email);
        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ message: "Login failed.", error: error.message });
    }
});

// DEBUG: Get all users (REMOVE IN PRODUCTION)
router.get("/debug/users", async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        console.log("All users in database:", users);
        return res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: error.message });
    }
});

// DEBUG: Test password for specific email
router.post("/debug/test-password", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        return res.json({
            email: user.email,
            passwordMatches: isMatch,
            hashedPassword: user.password.substring(0, 10) + "..."
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// FORGOT PASSWORD - Send reset link
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    console.log("Forgot password request for:", email);

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log("User not found for email:", email);
            return res.status(404).json({ message: "User not found with this email." });
        }

        // Generate a reset token (valid for 1 hour)
        const resetToken = user.generatePasswordResetToken(3600); // 1 hour
        await user.save();

        console.log("Reset token generated for:", email);

        // In production, send this via email
        // For now, we'll return it (remove in production!)
        return res.json({
            message: "Password reset token generated. Use this to reset your password.",
            resetToken: resetToken, // REMOVE THIS IN PRODUCTION - only send via email
            expiresIn: "1 hour"
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Error processing request.", error: error.message });
    }
});

// RESET PASSWORD - Update password with token
router.post("/reset-password", async (req, res) => {
    const { resetToken, newPassword } = req.body;

    console.log("Reset password request with token");

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    try {
        const user = await User.findOne({
            passwordResetToken: resetToken,
            passwordResetExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.log("❌ Invalid or expired reset token");
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        console.log("✅ Valid token. Updating password for:", user.email);

        // Set new password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;

        await user.save();

        console.log("✅ Password updated successfully for:", user.email);

        return res.json({
            message: "Password reset successful! You can now login with your new password."
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Error resetting password.", error: error.message });
    }
});

// ADMIN SETUP - Create/Update admin user
router.post("/setup-admin", async (req, res) => {
    const { email, password } = req.body;

    console.log("Admin setup request for:", email);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    try {
        let adminUser = await User.findOne({ email: email.toLowerCase() });

        if (!adminUser) {
            // Create new admin user
            console.log("Creating new admin user...");
            adminUser = new User({
                name: "Admin Dashboard",
                email: email.toLowerCase(),
                phone: "",
                password: password,
                role: "admin"
            });
        } else {
            // Update existing user to admin
            console.log("Updating existing user to admin...");
            adminUser.password = password;
            adminUser.role = "admin";
        }

        await adminUser.save();

        console.log("✅ Admin user setup successful for:", email);

        return res.json({
            message: "Admin user setup successful!",
            admin: {
                _id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (error) {
        console.error("Admin setup error:", error);
        return res.status(500).json({ message: "Error setting up admin.", error: error.message });
    }
});

module.exports = router;
