const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

    category: String,
    location: String,
    details: String,
    image: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        default: "Pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);