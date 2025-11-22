const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/auth.cjs");
const { addMessage, getMessagesForTask, getUserById } = require("../db.cjs");

const router = express.Router();

// Configure multer for chat media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/chat");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `chat-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    
    if (isImage || isVideo) {
      return cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"));
    }
  },
});

// Auth required: upload chat media
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload file" });
  }
});

// Auth required: send a message
router.post("/", authMiddleware, (req, res) => {
  const { taskId, toUserId, message, mediaType, mediaUrl } = req.body;

  if (!taskId || !toUserId) {
    return res.status(400).json({ message: "Task id and toUserId are required" });
  }

  if (!message && !mediaUrl) {
    return res.status(400).json({ message: "Message or media is required" });
  }

  const newMessage = addMessage({
    taskId: Number(taskId),
    fromUserId: req.user.id,
    toUserId: Number(toUserId),
    message: message ? String(message).trim() : "",
    mediaType: mediaType || null,
    mediaUrl: mediaUrl || null,
  });

  // Get user name for the message
  const fromUser = getUserById(req.user.id);
  const messageWithUser = {
    ...newMessage,
    fromUserName: fromUser?.name || `User ${req.user.id}`,
  };

  res.status(201).json(messageWithUser);
});

// Auth required: get messages for a task
router.get("/:taskId", authMiddleware, (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const messages = getMessagesForTask(taskId);
  
  // Add user names to messages
  const messagesWithUsers = messages.map((msg) => {
    const fromUser = getUserById(msg.fromUserId);
    return {
      ...msg,
      fromUserName: fromUser?.name || `User ${msg.fromUserId}`,
    };
  });

  res.json(messagesWithUsers);
});

module.exports = router;

