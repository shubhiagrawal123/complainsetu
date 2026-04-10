const express = require("express");
const router = express.Router();
const multer = require("multer");
const Complaint = require("../models/Complaint");
const transporter = require("../utils/mailer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {

    try {

        const { category, location, details, lat, lng } = req.body;

        const image = req.file ? req.file.filename : null;

        const complaint = new Complaint({
            category,
            location,
            details,
            image,
            coordinates: {
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null
            }
        });

        await complaint.save();

        // EMAIL SEND
        await transporter.sendMail({

            from: process.env.EMAIL_USER,
            to: process.env.DEPARTMENT_EMAIL,

            subject: "New Complaint Registered",

            text: `
Complaint Details

Category: ${category}
Location: ${location}
Details: ${details}
      `,

            attachments: req.file
                ? [
                    {
                        filename: req.file.filename,
                        path: `uploads/${req.file.filename}`
                    }
                ]
                : []

        });

        res.json({
            message: "Complaint submitted and email sent",
            complaintId: complaint._id
        });

    } catch (error) {

        res.status(500).json({ message: "Error submitting complaint" });

    }

});
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    try {
        // optional filters from query
        const status = req.query.status;
        const category = req.query.category;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching complaints" });
    }
});

router.get("/:id", async (req, res) => {

    try {

        const id = req.params.id;

        // check valid mongo id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Complaint ID" });
        }

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(complaint);

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Server error" });

    }

});

router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Complaint ID" });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json({ message: "Status updated", complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating complaint status" });
    }
});
// PUT /api/complaints/:id
router.put("/:id", async (req, res) => {
    const { status } = req.body;

    const updated = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    res.json(updated);
});

module.exports = router;