const express = require("express");
const multer = require("multer");
const Complaint = require("../models/Complaint");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");
const router = express.Router();
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});
router.post("/", protect, upload.single("image"), async (req, res) => {

  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: "Title, description, category and location are required",
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      image: req.file ? req.file.path : null,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
// user can vote on a complaint
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (!complaint.votes) {
      complaint.votes = [];
    }

    const userId = req.user.userId;

    const alreadyVoted = complaint.votes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    complaint.votes.push(userId);

    await complaint.save();

    res.json({
      message: "Vote added successfully",
      votes: complaint.votes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
router.get("/my", protect, async (req, res) => {
  try {
    console.log("========== MY COMPLAINTS ==========");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", req.user.userId);

    const complaints = await Complaint.find({
      createdBy: req.user.userId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    console.log("RESULT:", complaints);

    res.json(complaints);
  } catch (error) {
    console.log("MY COMPLAINTS ERROR:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

//all complaints 
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

//admin can update the status of a complaint or delete a complaint

router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    complaint.status = status;

    await complaint.save();

    res.json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
//user can upload their own complaints 


router.get("/my", protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      createdBy: req.user.userId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
//
// Delete own complaint
router.delete("/:id", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Only owner can delete
    if (
      complaint.createdBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own complaint",
      });
    }

    await Complaint.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Complaint deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;