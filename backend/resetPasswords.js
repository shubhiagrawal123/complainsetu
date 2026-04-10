const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetPasswords() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/complainsetu");

        const users = await User.find({});

        const defaultPassword = "password123"; // Set a default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        for (const user of users) {
            console.log(`Resetting password for user: ${user.email}`);
            await User.updateOne({ _id: user._id }, { password: hashedPassword });
            console.log(`Password reset for user: ${user.email}`);
        }

        console.log("All passwords reset to 'password123'.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

resetPasswords();