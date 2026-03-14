const express = require("express");
const router = express.Router();
const multer = require("multer");
const Complaint = require("../models/Complaint");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/complaints", upload.single("file"), async (req, res) => {

  try {

    const { category, location, details } = req.body;

    const image = req.file ? req.file.filename : null;

    const complaint = new Complaint({
      category,
      location,
      details,
      image
    });

    await complaint.save();

    res.json({ message: "Complaint submitted successfully" });

  } catch (error) {

    res.status(500).json({ message: "Error submitting complaint" });

  }

});
module.exports = router;