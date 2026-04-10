const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const adminEmail = "patelyash47597@gmail.com";
const adminPassword = "admin@123"; // Change this to a strong password!

async function setupAdmin() {
    try {
        console.log("🔐 Starting admin setup...");
        console.log("MongoDB URI:", process.env.MONGO_URI);

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail.toLowerCase() });

        if (admin) {
            console.log("⚠️  Admin user already exists. Updating password...");
            admin.password = adminPassword;
            admin.role = "admin";
            await admin.save();
            console.log("✅ Admin password updated!");
        } else {
            console.log("📝 Creating new admin user...");
            admin = new User({
                name: "Admin Dashboard",
                email: adminEmail.toLowerCase(),
                phone: "",
                password: adminPassword,
                role: "admin"
            });
            await admin.save();
            console.log("✅ Admin user created!");
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ ADMIN SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role: admin`);
        console.log("=".repeat(60));
        console.log("\n📌 You can now login to the Admin Dashboard at /admin");
        console.log("   with these credentials.\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting up admin:", error);
        process.exit(1);
    }
}

setupAdmin();
