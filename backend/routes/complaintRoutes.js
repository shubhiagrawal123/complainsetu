const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

router.post("/", async (req, res) => {
    try {
        const complaint = new Complaint(req.body);
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    const complaints = await Complaint.find();
    res.json(complaints);
});

module.exports = router;