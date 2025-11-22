const express = require("express");
const { authMiddleware } = require("../middleware/auth.cjs");
const { addRating, addReview, getUserById } = require("../db.cjs");

const router = express.Router();

// POST /api/ratings
// body: { toUserId, score (1-5), comment?, taskId? }
router.post("/", authMiddleware, (req, res) => {
  const { toUserId, score, comment, taskId } = req.body;

  const toId = Number(toUserId);
  const numericScore = Number(score);

  if (!toId || !Number.isFinite(numericScore)) {
    return res.status(400).json({ message: "toUserId and score are required" });
  }

  if (numericScore < 1 || numericScore > 5) {
    return res.status(400).json({ message: "Score must be between 1 and 5" });
  }

  if (toId === req.user.id) {
    return res.status(400).json({ message: "You cannot rate yourself" });
  }

  const target = getUserById(toId);
  if (!target) {
    return res.status(404).json({ message: "User to rate not found" });
  }

  const rating = addRating({
    toUserId: toId,
    fromUserId: req.user.id,
    score: numericScore,
    taskId: taskId || null,
  });

  if (comment && String(comment).trim().length > 0) {
    addReview({
      toUserId: toId,
      fromUserId: req.user.id,
      taskId: taskId || null,
      comment: String(comment).trim(),
      score: numericScore,
    });
  }

  res.status(201).json(rating);
});

module.exports = router;
