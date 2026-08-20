const express = require("express");
const Comment = require("../models/Comment");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add comment
router.post("/", protect, async (req, res) => {
  try {
    const { text, complaint, suggestion } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    if (!complaint && !suggestion) {
      return res.status(400).json({
        message: "Complaint or suggestion is required",
      });
    }

    if (complaint && suggestion) {
      return res.status(400).json({
        message: "Comment can belong to either complaint or suggestion",
      });
    }

    const comment = await Comment.create({
      text,
      createdBy: req.user.userId,
      complaint: complaint || null,
      suggestion: suggestion || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("createdBy", "name");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Get comments for a complaint
router.get("/complaint/:id", async (req, res) => {
  try {
    const comments = await Comment.find({
      complaint: req.params.id,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Get comments for a suggestion
router.get("/suggestion/:id", async (req, res) => {
  try {
    const comments = await Comment.find({
      suggestion: req.params.id,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;