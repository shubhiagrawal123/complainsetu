const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function setPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/complainsetu");

        const user = await User.findOne({ email: "23cs10ya154@mitsgwl.ac.in" });
        if (!user) {
            console.log("User not found");
            return;
        }

        // Use raw update to bypass mongoose hooks
        await mongoose.connection.db.collection('users').updateOne(
            { email: "23cs10ya154@mitsgwl.ac.in" },
            { $set: { password: "$2a$10$RkfM94yX6cTWoEdgSoO4w.8FxUlmRhaXvhUjvV0O7jXHwig4MCXZS" } }
        );

        console.log("Password set for user");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

setPassword();