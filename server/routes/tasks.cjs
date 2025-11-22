const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/auth.cjs");
const {
  createTask,
  getAllTasks,
  getTasksByPosterId,
  getTasksByAssigneeId,
  updateTask,
} = require("../db.cjs");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `task-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Public: list tasks with basic filters
router.get("/", (req, res) => {
  const { search, category, urgency } = req.query;
  let tasks = getAllTasks();
  
  // Filter out expired tasks
  const now = new Date();
  tasks = tasks.filter((t) => {
    if (!t.deadline) return true;
    return new Date(t.deadline) > now;
  });

  if (search) {
    const q = String(search).toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  if (category && category !== "all") {
    tasks = tasks.filter((t) => t.category === category);
  }

  if (urgency && urgency !== "all") {
    tasks = tasks.filter((t) => t.urgency === urgency);
  }

  res.json(tasks);
});

// Image upload endpoint
router.post("/upload-images", authMiddleware, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload images" });
  }
});

// Auth required: create task
router.post("/", authMiddleware, (req, res) => {
  const { title, description, category, urgency, location, budget, womenSafe, verifiedOnly, latitude, longitude, deadline, images } = req.body;

  if (!title || !description || !category || !urgency || !location || !deadline) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const latNum = typeof latitude === "number" ? latitude : undefined;
  const lngNum = typeof longitude === "number" ? longitude : undefined;

  const task = createTask({
    title,
    description,
    category,
    urgency,
    location,
    budget: budget || null,
    womenSafe: !!womenSafe,
    verifiedOnly: !!verifiedOnly,
    deadline: deadline || null,
    posterId: req.user.id,
    latitude: latNum,
    longitude: lngNum,
    images: images || [], // Array of image URLs
  });

  res.status(201).json(task);
});

// Auth required: tasks posted by current user
router.get("/mine", authMiddleware, (req, res) => {
  const tasks = getTasksByPosterId(req.user.id);
  // Filter out expired tasks
  const now = new Date();
  const active = tasks.filter((t) => {
    if (!t.deadline) return true;
    return new Date(t.deadline) > now;
  });
  res.json(active);
});

// Auth required: tasks accepted by current user (placeholder for future accept flow)
router.get("/accepted", authMiddleware, (req, res) => {
  const tasks = getTasksByAssigneeId(req.user.id);
  // Filter out expired tasks
  const now = new Date();
  const active = tasks.filter((t) => {
    if (!t.deadline) return true;
    return new Date(t.deadline) > now;
  });
  res.json(active);
});

// Auth required: update basic status (e.g., mark completed)
router.patch("/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Task id and status are required" });
  }

  const updated = updateTask(id, { status });
  if (!updated) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(updated);
});

// Auth required: accept a task as helper (multiple acceptances allowed)
router.post("/:id/accept", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const existing = updateTask(id, {});
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (existing.posterId === req.user.id) {
    return res.status(400).json({ message: "You cannot accept your own task" });
  }

  // Check if task is already assigned (completed state means owner picked someone)
  if (existing.status === "assigned") {
    return res.status(400).json({ message: "Task is already assigned to someone" });
  }

  // Initialize acceptances array if not exists
  if (!existing.acceptances) {
    existing.acceptances = [];
  }

  // Check if user already accepted
  if (existing.acceptances.some(a => a.userId === req.user.id)) {
    return res.status(400).json({ message: "You have already accepted this task" });
  }

  // Add new acceptance
  existing.acceptances.push({
    userId: req.user.id,
    acceptedAt: new Date().toISOString()
  });

  // If this is first acceptance, mark as "pending" (has acceptances waiting for owner review)
  const newStatus = existing.acceptances.length === 1 ? "pending_approval" : existing.status || "pending_approval";

  const updated = updateTask(id, {
    acceptances: existing.acceptances,
    status: newStatus,
  });

  res.json(updated);
});

// Auth required: owner assigns task to specific helper
router.post("/:id/assign", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { userId } = req.body;

  if (!id || !userId) {
    return res.status(400).json({ message: "Task id and userId are required" });
  }

  const existing = updateTask(id, {});
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Only task owner can assign
  if (existing.posterId !== req.user.id) {
    return res.status(403).json({ message: "Only task owner can assign helpers" });
  }

  // Check if the user has accepted the task
  if (!existing.acceptances || !existing.acceptances.some(a => a.userId === userId)) {
    return res.status(400).json({ message: "User has not accepted this task" });
  }

  const updated = updateTask(id, {
    assignedToUserId: userId,
    status: "assigned",
  });

  res.json(updated);
});

// Auth required: mark task as completed
router.post("/:id/complete", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const existing = updateTask(id, {});
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Only the assigned helper or task owner can mark as complete
  if (existing.assignedToUserId !== req.user.id && existing.posterId !== req.user.id) {
    return res.status(403).json({ message: "Only the helper or task owner can mark as completed" });
  }

  const updated = updateTask(id, {
    status: "completed",
    completedAt: new Date().toISOString(),
  });

  res.json(updated);
});

module.exports = router;
