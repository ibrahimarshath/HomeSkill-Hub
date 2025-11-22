const express = require("express");
const { getUserById, getRatingsForUser, getReviewsForUser } = require("../db.cjs");

const router = express.Router();

// GET /api/users/:id - Public endpoint to get user basic info
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ratings = getRatingsForUser(id);
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount === 0
      ? null
      : ratings.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / ratingCount;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avgRating,
    ratingCount,
  });
});

// GET /api/users/:id/summary
// Returns: { id, name, email, avgRating, ratingCount }
router.get("/:id/summary", (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ratings = getRatingsForUser(id);
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount === 0
      ? null
      : ratings.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / ratingCount;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avgRating,
    ratingCount,
  });
});

// GET /api/users/:id/reviews
router.get("/:id/reviews", (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reviews = getReviewsForUser(id);
  res.json(reviews);
});

module.exports = router;
