const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function hashExistingPasswords() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/complainsetu");

        const users = await User.find({});

        for (const user of users) {
            if (user.password && !user.password.startsWith("$2")) {
                // Password is not hashed
                console.log(`Hashing password for user: ${user.email}`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                console.log(`Password hashed for user: ${user.email}`);
                // Use updateOne to avoid triggering pre-save hook
                await User.updateOne({ _id: user._id }, { password: hashedPassword });
            } else {
                console.log(`Password already hashed for user: ${user.email}`);
            }
        }

        console.log("All passwords checked and hashed if necessary.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

hashExistingPasswords();