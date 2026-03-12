const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
    category: String,
    location: String,
    description: String,
    image: String,
    status: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);