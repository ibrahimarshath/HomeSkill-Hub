const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getUserById, getRatingsForUser, getReviewsForUser, updateUser } = require("../db.cjs");
const { authMiddleware } = require("../middleware/auth.cjs");

const router = express.Router();

// Auth required: upload profile photo (must be before /:id route)
router.post("/upload-photo", authMiddleware, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user's profile photo
    const user = getUserById(req.user.id);
    if (user) {
      updateUser(req.user.id, { profilePhoto: photoUrl });
    }

    res.json({ url: photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload photo" });
  }
});

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/profiles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const userId = req.user?.id || "unknown";
    cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
    }
  },
});

// Auth required: upload profile photo (must be before /:id route)
router.post("/upload-photo", authMiddleware, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user's profile photo
    const user = getUserById(req.user.id);
    if (user) {
      updateUser(req.user.id, { profilePhoto: photoUrl });
    }

    res.json({ url: photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload photo" });
  }
});

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
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    gender: user.gender || null,
    phoneNumber: user.phoneNumber || null,
    profilePhoto: user.profilePhoto || null,
    avgRating,
    ratingCount,
  });
});

// GET /api/users/:id/summary
// Returns: { id, name, email, firstName, lastName, gender, phoneNumber, avgRating, ratingCount }
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
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    gender: user.gender || null,
    phoneNumber: user.phoneNumber || null,
    profilePhoto: user.profilePhoto || null,
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

// Auth required: update user profile
router.patch("/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  // Only users can update their own profile
  if (id !== req.user.id) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }

  const { firstName, lastName, gender, phoneNumber, profilePhoto } = req.body;

  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (gender !== undefined) updates.gender = gender;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

  // Update name if firstName or lastName changed
  if (firstName !== undefined || lastName !== undefined) {
    const user = getUserById(id);
    if (user) {
      const newFirstName = firstName !== undefined ? firstName : user.firstName;
      const newLastName = lastName !== undefined ? lastName : user.lastName;
      if (newFirstName && newLastName) {
        updates.name = `${newFirstName} ${newLastName}`;
      }
    }
  }

  const updated = updateUser(id, updates);
  if (!updated) {
    return res.status(404).json({ message: "User not found" });
  }

  const ratings = getRatingsForUser(id);
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount === 0
      ? null
      : ratings.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / ratingCount;

  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    firstName: updated.firstName || null,
    lastName: updated.lastName || null,
    gender: updated.gender || null,
    phoneNumber: updated.phoneNumber || null,
    profilePhoto: updated.profilePhoto || null,
    avgRating,
    ratingCount,
  });
});

module.exports = router;
