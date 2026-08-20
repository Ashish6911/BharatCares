const express = require("express");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Suggestion = require("../models/Suggestion");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalComplaints = await Complaint.countDocuments();

    const pendingComplaints = await Complaint.countDocuments({
      status: "Pending",
    });

    const inProgressComplaints = await Complaint.countDocuments({
      status: "In Progress",
    });

    const resolvedComplaints = await Complaint.countDocuments({
      status: "Resolved",
    });

    const totalSuggestions = await Suggestion.countDocuments();

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalSuggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;