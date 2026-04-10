const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    passwordResetToken: {
        type: String,
        default: undefined
    },
    passwordResetExpire: {
        type: Date,
        default: undefined
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre("save", async function () {
    console.log("Pre-save hook triggered. Is password modified?", this.isModified("password"));

    if (!this.isModified("password")) {
        return;
    }

    try {
        console.log("Hashing password for email:", this.email);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        console.log("Password hashed successfully");
        this.password = hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        console.log("Comparing passwords. Stored hash length:", this.password.length);
        console.log("Candidate password:", candidatePassword);
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log("Password comparison result:", isMatch);
        return isMatch;
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "7d" }
    );
    return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function (expiresInSeconds = 3600) {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token and save to DB
    this.passwordResetToken = resetToken;
    this.passwordResetExpire = new Date(Date.now() + expiresInSeconds * 1000);

    console.log("Reset token generated, expires in:", expiresInSeconds, "seconds");

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);