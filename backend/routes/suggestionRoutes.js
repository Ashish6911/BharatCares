const express = require("express");
const Suggestion = require("../models/Suggestion");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const suggestion = await Suggestion.create({
      title,
      description,
      category,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Suggestion created successfully",
      suggestion,
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
    console.log("========== MY SUGGESTIONS ==========");
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", req.user.userId);

    const suggestions = await Suggestion.find({
      createdBy: req.user.userId,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    console.log("RESULT:", suggestions);

    res.json(suggestions);
  } catch (error) {
    console.log("MY SUGGESTIONS ERROR:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

//suggesttion

router.get("/", async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


//vote for a suggestion  



router.post("/:id/vote", protect, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    const userId = req.user.userId;

    const alreadyVoted = suggestion.votes.some(
      (vote) => vote.toString() === userId
    );

    if (alreadyVoted) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    suggestion.votes.push(userId);

    await suggestion.save();

    res.json({
      message: "Vote added successfully",
      voteCount: suggestion.votes.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
//delete
// Delete own suggestion
router.delete("/:id", protect, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(
      req.params.id
    );

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    // Only owner can delete
    if (
      suggestion.createdBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own suggestion",
      });
    }

    await Suggestion.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Suggestion deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
module.exports = router;